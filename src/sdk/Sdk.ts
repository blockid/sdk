import { generateRandomPrivateKey } from "eth-utils";
import { from } from "rxjs";
import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map, switchMap } from "rxjs/operators";
import { Account, IAccount, IAccountAttributes } from "../account";
import { AccountStates } from "../account/constants";
import { Api, ApiEvents, ApiSessionStates, IApi } from "../api";
import { Device, IDevice, IDeviceAttributes } from "../device";
import { Ens, IEns } from "../ens";
import {
  ILinker,
  Linker,
  LinkerActionPayloads,
  LinkerActionsTypes,
  LinkerTargetTypes,
} from "../linker";
import { INetwork, Network } from "../network";
import { IRegistry, Registry } from "../registry";
import { IStorage, Storage } from "../storage";
import { SdkStorageKeys } from "./constants";
import { ISdk, ISdkOptions, ISdkSettings } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  public error$ = new ErrorSubject();

  public account: IAccount;

  public api: IApi;

  public device: IDevice;

  public ens: IEns;

  public linker: ILinker;

  public network: INetwork;

  public registry: IRegistry;

  private settings$ = new UniqueBehaviorSubject<ISdkSettings>(null);

  private readonly storage: IStorage = null;

  /**
   * constructor
   * @param options
   */
  constructor(options: ISdkOptions = {}) {
    options = {
      account: null,
      api: null,
      linker: null,
      network: null,
      storage: null,
      ...(options || {}),
    };

    this.network = new Network(options.network);
    this.ens = new Ens(this.network);
    this.linker = new Linker(options.linker);
    this.device = new Device(this.network);
    this.api = new Api(this.device, options.api);
    this.account = new Account(this.api, this.device, this.network, options.account);
    this.registry = new Registry(this.account, this.api, this.device, this.network);

    if (options.storage) {
      this.storage = new Storage(options.storage);
    }
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
      await this.configureDevice();
      await this.configureApi();
      await this.configureEns();
      await this.configureNetwork();
      await this.configureRegistry();

    } catch (err) {
      this.error$.next(err);
    }

    return this;
  }

  /**
   * creates api session
   */
  public createApiSession(): Promise<void> {
    return this.error$.wrapTAsync(this.api.createSession());
  }

  /**
   * destroys api session
   */
  public destroyApiSession(): void {
    this.api.destroySession();
  }

  /**
   * mute api connection
   */
  public muteApiConnection(): void {
    try {
      this.api.muteConnection();
    } catch (err) {
      this.error$.next(err);
    }
  }

  /**
   * un mute api connection
   */
  public unMuteApiConnection(): void {
    try {
      this.api.unMuteConnection();
    } catch (err) {
      this.error$.next(err);
    }
  }

  /**
   * lookup account
   * @param accountEnsName
   */
  public accountExists(accountEnsName: string): Promise<boolean> {
    return this.error$.wrapTAsync(async () => {
      return !!(await this.api.getAccount(accountEnsName));
    });
  }

  /**
   * joins account
   * @param accountEnsName
   */
  public joinAccount(accountEnsName: string): Promise<string> {
    return this.error$.wrapTAsync(async () => {
      let result: string = null;
      const accountAttributes = await this.api.getAccount(accountEnsName);

      if (!accountAttributes) {
        return;
      }

      const accountDeviceAttributes = await this.api.getAccountDevice(accountEnsName, this.device.address);

      if (accountDeviceAttributes) {
        this.account.attributes = accountAttributes;
      } else {
        result = this.linker.buildActionUrl<LinkerActionPayloads.ICreateAccountDevice>({
          type: LinkerActionsTypes.CreateAccountDevice,
          from: {
            type: LinkerTargetTypes.Device,
            data: this.device.address,
          },
          payload: {
            networkVersion: this.network.version,
            accountEnsName: this.account.ensName,
            deviceAddress: this.device.address,
          },
        });
      }

      return result;
    });
  }

  /**
   * creates account
   * @param accountEnsName
   */
  public createAccount(accountEnsName: string): Promise<void> {
    return this.error$.wrapTAsync(async () => {
      const accountAttributes = await this.api.createAccount(accountEnsName);

      if (!accountAttributes) {
        return;
      }

      this.account.attributes = accountAttributes;
    });
  }

  /**
   * deploys account
   */
  public deployAccount(): Promise<void> {
    return this.error$.wrapTAsync(async () => {
      const deviceSignature = await this.registry.buildAccountDeploymentSignature();
      const guardianSignature = await this.api.getAccountGuardianDeploymentSignature(
        this.account.ensName,
        deviceSignature,
      );

      if (await this.registry.deployAccount(deviceSignature, guardianSignature)) {
        this.account.updateLocalAttributes({
          state: AccountStates.Deploying,
        });
      }
    });
  }

  protected async configureStorage(): Promise<void> {
    if (!this.storage) {
      return;
    }

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

    // account
    {
      const key = SdkStorageKeys.Account;
      const attributes = await this.storage.getDoc<IAccountAttributes>(key);
      if (attributes) {
        this.account.attributes = attributes;
      }

      this
        .account
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
    this
      .api
      .options$
      .pipe(
        filter((options) => !!options),
        switchMap(() => from(this.error$.wrapTAsync(
          this.api.getSettings(),
        ))),
      )
      .subscribe(this.settings$);

    this
      .api
      .session
      .state$
      .pipe(
        filter((state) => state === ApiSessionStates.Verified),
        switchMap(() => from(this.error$.wrapTAsync(async () => {
          //
        }))),
      )
      .subscribe();

    this
      .api
      .event$
      .pipe(
        switchMap(({ type, payload }) => from(this.error$.wrapTAsync(async () => {
          switch (type) {
            case ApiEvents.Types.ConnectionMuted:
              this.api.connection.muted = true;
              break;

            case ApiEvents.Types.ConnectionUnMuted:
              this.api.connection.muted = false;
              break;

            case ApiEvents.Types.AccountUpdated:
              const { ensName } = payload as ApiEvents.Payloads.IAccount;
              if (this.account.ensName === ensName) {
                const attributes = await this.api.getAccount(ensName);

                if (attributes) {
                  this.account.attributes = attributes;
                }
              }
              break;
          }
        }))),
      )
      .subscribe();
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
