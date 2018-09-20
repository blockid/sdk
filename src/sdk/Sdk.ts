import { from } from "rxjs";
import { filter, switchMap, map } from "rxjs/operators";
import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { generateRandomPrivateKey } from "eth-utils";
import { Api, ApiStates, IApi } from "../api";
import { Device, IDevice, IDeviceAttributes } from "../device";
import { Ens, IEns } from "../ens";
import { ILinker, Linker } from "../linker";
import { INetwork, Network } from "../network";
import { IRegistry, Registry } from "../registry";
import { ISession, Session } from "../session";
import { ISharedAccount, ISharedAccountAttributes, SharedAccount } from "../sharedAccount";
import { IStorage, Storage } from "../storage";
import { SdkStorageKeys } from "./constants";
import { ISdk, ISdkOptions, ISdkSettings } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  public error$ = new ErrorSubject();

  public api: IApi;

  public device: IDevice;

  public ens: IEns;

  public linker: ILinker;

  public network: INetwork;

  public registry: IRegistry;

  public session: ISession;

  public sharedAccount: ISharedAccount;

  private settings$ = new UniqueBehaviorSubject<ISdkSettings>(null);

  private storage: IStorage;

  /**
   * constructor
   * @param options
   */
  constructor(options: ISdkOptions = {}) {
    options = {
      api: null,
      linker: null,
      network: null,
      session: null,
      sharedAccount: null,
      storage: null,
      ...(options || {}),
    };

    this.api = new Api(options.api);
    this.network = new Network(options.network);
    this.ens = new Ens(this.network);
    this.linker = new Linker(options.linker);
    this.device = new Device(this.network);
    this.registry = new Registry(this.device, this.network);
    this.sharedAccount = new SharedAccount(this.api, this.device, this.network, options.sharedAccount);
    this.session = new Session(this.api, this.device, options.session);
    this.storage = new Storage(options.storage);
  }

  /**
   * configures
   */
  public async configure(additionalOptions: ISdkOptions = {}): Promise<ISdk> {
    try {
      if (additionalOptions.api) {
        this.api.options = additionalOptions.api;
      }

      await this.configureStorage();
      await this.configureApi();
      await this.configureDevice();
      await this.configureEns();
      await this.configureNetwork();
      await this.configureRegistry();

    } catch (err) {
      this.error$.next(err);
    }

    return this;
  }

  public signUp(ensName: string): void {
    //
  }

  public signIn(ensName: string): void {
    //
  }

  protected async configureStorage(): Promise<void> {
    // device
    {
      const key = SdkStorageKeys.Device;
      const attributes = await this.storage.getDoc<IDeviceAttributes>(key);
      if (attributes) {
        this.device.attributes = attributes;
      }

      this
        .device
        .attributes$
        .subscribe((attributes) => this
          .error$
          .wrapAsync(() => this.storage.setDoc(key, attributes)),
        );
    }

    // shared account
    {
      const key = SdkStorageKeys.SharedAccount;
      const attributes = await this.storage.getDoc<ISharedAccountAttributes>(key);
      if (attributes) {
        this.sharedAccount.attributes = attributes;
      }

      this
        .sharedAccount
        .attributes$
        .subscribe((attributes) => this
          .error$
          .wrapAsync(() => this.storage.setDoc(key, attributes)),
        );
    }

    // settings
    {
      const key = SdkStorageKeys.Settings;
      const settings = await this.storage.getDoc<ISdkSettings>(key);
      if (settings) {
        this.settings$.next(settings);
      }

      this
        .settings$
        .subscribe((settings) => this
          .error$
          .wrapAsync(() => this.storage.setDoc(key, settings)),
        );
    }
  }

  protected async configureApi(): Promise<void> {
    this.api
      .state$
      .pipe(
        filter((state) => state === ApiStates.Connected),
        switchMap(() => from(this.error$.wrapTAsync<ISdkSettings>(
          this.api.callGetSettings(),
        ))),
      )
      .subscribe(this.settings$);
  }

  protected configureDevice(): void {
    if (!this.device.address) {
      this.device.attributes = {
        privateKey: generateRandomPrivateKey(),
      };
    }
  }

  protected configureEns(): void {
    this
      .settings$
      .pipe(
        filter((settings) => !!settings),
        map((settings) => settings.ens),
      )
      .subscribe(this.ens.attributes$);
  }

  protected configureNetwork(): void {
    this
      .settings$
      .pipe(
        filter((settings) => !!settings),
        map((settings) => settings.network),
      )
      .subscribe(this.network.attributes$);
  }

  protected configureRegistry(): void {
    this
      .settings$
      .pipe(
        filter((settings) => !!settings),
        map((settings) => settings.registry),
      )
      .subscribe(this.registry.attributes$);
  }
}
