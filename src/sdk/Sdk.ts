import { concat, from } from "rxjs";
import { filter, switchMap } from "rxjs/operators";
import { Api, ApiStates, IApi } from "../api";
import { Device, IDevice, IDeviceAttributes } from "../device";
import { Ens, IEns } from "../ens";
import { Linker, ILinker } from "../linker";
import { Identity, IIdentity, IIdentityAttributes } from "../identity";
import { INetwork, Network } from "../network";
import { IRegistry, Registry } from "../registry";
import { generateRandomPrivateKey, TUniqueBehaviorSubject, UniqueBehaviorSubject } from "../shared";
import { IStorage, Storage } from "../storage";
import { SdkStorageKeys } from "./constants";
import { ISdk, ISdkOptions } from "./interfaces";
import { TSdkSettings } from "./types";
import { SdkError } from "./SdkError";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  /**
   * error subject
   */
  public settings$: TUniqueBehaviorSubject<TSdkSettings>;

  /**
   * error subject
   */
  public error$ = new SdkError();

  /**
   * api
   */
  public api: IApi;

  /**
   * device
   */
  public device: IDevice;

  /**
   * ens
   */
  public ens: IEns;

  /**
   * linker
   */
  public linker: ILinker;

  /**
   * identity
   */
  public identity: IIdentity;

  /**
   * network
   */
  public network: INetwork;

  /**
   * registry
   */
  public registry: IRegistry;

  private storage: IStorage;

  /**
   * constructor
   * @param options
   */
  constructor(options: ISdkOptions) {
    this.settings$ = new UniqueBehaviorSubject<TSdkSettings>(
      null,
      (settings, settingsOld) => {
        return settings
          ? {
            ...(settingsOld || {}),
            ...settings,
          } : null;
      });

    this.network = new Network();
    this.ens = new Ens(this.network);
    this.device = new Device(this.network);
    this.api = new Api(this.device, options.api);
    this.linker = new Linker(options.linker || null);
    this.identity = new Identity(this.api, this.device);
    this.registry = new Registry(this.api, this.network, this.device);
    this.storage = new Storage(options.storage);

    concat<any>(
      this.api.state$,
      this.device.address$,
    )
      .pipe(
        filter(() => (
          this.device.address &&
          this.api.state === ApiStates.Connected
        )),
      )
      .subscribe(() => this
        .error$
        .wrapAsync(this.api.verifySession()),
      );

    this
      .api
      .state$
      .pipe(
        filter((state) => state === ApiStates.Verified),
        switchMap(() => from(this
          .error$
          .wrapTAsync(this.api.getSettings())),
        ),
        filter((settings) => !!settings),
      )
      .subscribe(this.settings$);

    this.error$.wrapAsync(this.setup());
  }

  private async setup(): Promise<void> {
    // device
    {
      let attributes = await this.storage.getDoc<IDeviceAttributes>(SdkStorageKeys.Device);

      if (!attributes) {
        attributes = {
          privateKey: generateRandomPrivateKey(),
        };

        await this.storage.setDoc(SdkStorageKeys.Device, attributes);
      }

      this.device.attributes = attributes;
    }

    // identity
    {
      const attributes = await this.storage.getDoc<IIdentityAttributes>(SdkStorageKeys.Identity);
      if (attributes) {
        this.identity.attributes = attributes;
      }

      this
        .identity
        .attributes$
        .subscribe((attributes) => this.error$.wrapAsync(
          this.storage.setDoc(SdkStorageKeys.Identity, attributes),
        ));
    }

    // settings
    {
      this
        .settings$
        .next(await this.storage.getDoc<TSdkSettings>(SdkStorageKeys.Settings));

      this
        .settings$
        .pipe(
          filter((settings) => !!settings),
        )
        .subscribe((settings) => {
          this.ens.attributes = settings.ens;
          this.network.attributes = settings.network;
          this.registry.attributes = settings.registry;

          this.error$.wrapAsync(
            this.storage.setDoc(SdkStorageKeys.Settings, settings),
          );
        });
    }
  }
}
