import { concat, Subject, from } from "rxjs";
import { filter, switchMap } from "rxjs/operators";
import { Api, ApiResponses, ApiStates, IApi } from "../api";
import { Device, IDevice, IDeviceAttributes } from "../device";
import { Ens, IEns, IEnsAttributes } from "../ens";
import { Identity, IIdentity, IIdentityAttributes } from "../identity";
import { INetwork, INetworkAttributes, Network } from "../network";
import { IRegistry, Registry } from "../registry";
import { generateRandomPrivateKey } from "../shared";
import { IStorage, Storage } from "../storage";
import { SdkStorageKeys } from "./constants";
import { ISdk, ISdkOptions } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  /**
   * error subject
   */
  public error$ = new Subject<any>();

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
    this.network = Network.create();
    this.ens = Ens.create(this.network);
    this.device = Device.create(this.network);
    this.api = Api.create(this.device, options.api);
    this.identity = Identity.create(this.api, this.device);
    this.registry = Registry.create(this.api, this.network, this.device);
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
      .subscribe(() => this.wrapVoidAsync(this.api.verifySession()));

    this
      .api
      .state$
      .pipe(
        filter((state) => state === ApiStates.Verified),
        switchMap(() => from(this.wrapTAsync(this.api.getSettings()))),
        filter((settings) => !!settings),
      )
      .subscribe((settings) => {
        if (settings) {
          this.ens.attributes = settings.ens;
          this.registry.attributes = settings.registry;
          this.network.attributes = settings.network;
        }
      });

    this.wrapVoidAsync(this.setup());
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

    // ens
    {
      const attributes = await this.storage.getDoc<IEnsAttributes>(SdkStorageKeys.Ens);
      if (attributes) {
        this.ens.attributes = attributes;
      }

      this
        .ens
        .attributes$
        .subscribe((attributes) => this.wrapVoidAsync(
          this.storage.setDoc(SdkStorageKeys.Ens, attributes),
        ));
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
        .subscribe((attributes) => this.wrapVoidAsync(
          this.storage.setDoc(SdkStorageKeys.Identity, attributes),
        ));
    }

    // network
    {
      const attributes = await this.storage.getDoc<INetworkAttributes>(SdkStorageKeys.Network);
      if (attributes) {
        this.network.attributes = attributes;
      }

      this
        .network
        .attributes$
        .subscribe((attributes) => this.wrapVoidAsync(
          this.storage.setDoc(SdkStorageKeys.Network, attributes),
        ));

    }
  }

  private wrapTAsync<T = any>(promise: Promise<T>): Promise<T> {
    return promise
      .catch((err) => {
        this.error$.next(err);
        return null;
      });
  }

  private wrapVoidAsync<T = any>(promise: Promise<T>): void {
    this.wrapTAsync(promise).catch(() => null);
  }
}
