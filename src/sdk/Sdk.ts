import { randomBytes } from "crypto";
import { generateRandomPrivateKey, recoverAddressFromPersonalMessage } from "eth-utils";
import { from } from "rxjs";
import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map, switchMap } from "rxjs/operators";
import {
  Account,
  AccountDevice,
  AccountDeviceStates,
  AccountStates,
  IAccount,
  IAccountAttributes,
  IAccountDevice,
  IAccountDeviceAttributes,
} from "../account";
import { Api, ApiEvents, ApiSessionStates, IApi } from "../api";
import { IAppAttributes } from "../app";
import { Device, IDevice, IDeviceAttributes } from "../device";
import { Ens, IEns } from "../ens";
import {
  ILinker,
  ILinkerAction,
  ILinkerActionSender,
  ILinkerActionUrls,
  Linker,
  LinkerActionPayloads,
  LinkerActionSenderTypes,
  LinkerActionsTypes,
} from "../linker";
import { INetwork, Network } from "../network";
import { IRegistry, Registry } from "../registry";
import { IStorage, Storage } from "../storage";
import { SdkStorageKeys } from "./constants";
import { ISdk, ISdkOptions, ISdkSecureAction, ISdkSettings } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  public error$ = new ErrorSubject();

  public account: IAccount;

  public accountDevice: IAccountDevice;

  public api: IApi;

  public device: IDevice;

  public ens: IEns;

  public linker: ILinker;

  public network: INetwork;

  public registry: IRegistry;

  private settings$ = new UniqueBehaviorSubject<ISdkSettings>(null);

  private readonly storage: IStorage = null;

  private secureAction: ISdkSecureAction = null;

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
    this.device = new Device(this.network);
    this.linker = new Linker(this.device, options.linker);
    this.api = new Api(this.device, options.api);
    this.account = new Account(this.api, this.device, this.network, options.account);
    this.registry = new Registry(this.account, this.api, this.device, this.network);
    this.accountDevice = new AccountDevice();

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
      await this.configureLinker();
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
   * @param account
   */
  public accountExists(account: Partial<IAccountAttributes>): Promise<boolean> {
    return this.error$.wrapTAsync(async () => {
      return !!(await this.api.getAccount(account));
    });
  }

  /**
   * joins account
   * @param account
   */
  public joinAccount(account: Partial<IAccountAttributes>): Promise<ILinkerActionUrls> {
    return this.error$.wrapTAsync(async () => {
      let result: ILinkerActionUrls = null;
      const accountAttributes = await this.api.getAccount(account);

      if (!accountAttributes) {
        return result;
      }

      const accountDeviceAttributes = await this.api.getAccountDevice(account, this.device.attributes);

      if (accountDeviceAttributes) {
        this.account.attributes = accountAttributes;
        this.accountDevice.attributes = accountDeviceAttributes;
      } else {
        result = this.linker.buildActionUrls<LinkerActionPayloads.ICreateAccountDevice>({
          type: LinkerActionsTypes.CreateAccountDevice,
          payload: {
            network: {
              version: this.network.version,
            },
            device: {
              address: this.device.address,
            },
            app: this.linker.app,
          },
        });
      }

      return result;
    });
  }

  /**
   * creates account
   * @param account
   */
  public createAccount(account: Partial<IAccountAttributes>): Promise<void> {
    return this.error$.wrapTAsync(async () => {
      const accountAttributes = await this.api.createAccount(account);

      if (!accountAttributes) {
        return;
      }

      const accountDeviceAttributes = await this.api.getAccountDevice(account, this.device.attributes);

      if (!accountDeviceAttributes) {
        return;
      }

      this.account.attributes = accountAttributes;
      this.accountDevice.attributes = accountDeviceAttributes;
    });
  }

  /**
   * deploys account
   */
  public deployAccount(): Promise<void> {
    return this.error$.wrapTAsync(async () => {
      try {
        this.account.updateLocalAttributes({
          state: AccountStates.Deploying,
        });

        const deviceSignature = await this.registry.buildAccountDeploymentSignature();
        const guardianSignature = await this.api.getAccountGuardianDeploymentSignature(
          this.account.attributes,
          deviceSignature,
        );

        if (!(await this.registry.deployAccount(deviceSignature, guardianSignature))) {
          this.account.revertLocalAttributes();
        }
      } catch (err) {
        this.account.revertLocalAttributes();
        throw err;
      }
    });
  }

  /**
   * resets account
   */
  public resetAccount(): void {
    this.account.attributes = null;
    this.accountDevice.attributes = null;
  }

  /**
   * creates secure action url
   * @param type
   */
  public createSecureActionUrl(type: LinkerActionsTypes): string {
    this.unMuteApiConnection();

    const hash = randomBytes(16);

    this.secureAction = {
      type,
      hash,
    };

    return this.linker.buildActionUrl<LinkerActionPayloads.ISecure>({
      type: LinkerActionsTypes.Secure,
      payload: {
        network: {
          version: this.network.version,
        },
        hash,
      },
    }, {
      senderType: LinkerActionSenderTypes.Device,
    });
  }

  /**
   * destroys secure action
   */
  public destroySecureAction(): void {
    this.muteApiConnection();
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

    // account device
    {
      const key = SdkStorageKeys.AccountDevice;
      const attributes = await this.storage.getDoc<IAccountDeviceAttributes>(key);
      if (attributes) {
        this.accountDevice.attributes = attributes;
      }

      this
        .accountDevice
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
      .connection
      .muted$
      .pipe(
        filter((muted) => muted),
      )
      .subscribe(() => {
        this.secureAction = null;
      });

    this
      .api
      .session
      .state$
      .pipe(
        filter((state) => state === ApiSessionStates.Verified),
        switchMap(() => from(this.error$.wrapTAsync(async () => {
          // TODO verify
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

            case ApiEvents.Types.AccountUpdated: {
              const { ensName } = payload as ApiEvents.Payloads.IAccount;
              if (this.account.ensName === ensName) {
                const accountAttributes = await this.api.getAccount(this.account.attributes);
                const accountDeviceAttributes = await this.api.getAccountDevice(this.account.attributes, this.device.attributes);

                if (accountAttributes && accountDeviceAttributes) {
                  this.account.attributes = accountAttributes;
                  this.accountDevice.attributes = accountDeviceAttributes;
                }
              }
              break;
            }

            case ApiEvents.Types.AccountDevice:
            case ApiEvents.Types.AccountDeviceAdded: {
              const { account, address } = payload as ApiEvents.Payloads.IAccountDevice;
              if (
                !this.account.ready &&
                address === this.device.address
              ) {
                const accountAttributes = await this.api.getAccount(account);
                const accountDeviceAttributes = await this.api.getAccountDevice(account, { address });

                if (accountAttributes && accountDeviceAttributes) {
                  this.account.attributes = accountAttributes;
                  this.accountDevice.attributes = accountDeviceAttributes;
                }
              }
              break;
            }

            case ApiEvents.Types.AccountDeviceUpdated: {
              const { account, address } = payload as ApiEvents.Payloads.IAccountDevice;
              if (
                this.account.ready &&
                account.ensName === this.account.ensName &&
                address === this.device.address
              ) {
                const accountDeviceAttributes = await this.api.getAccountDevice(account, { address });
                if (accountDeviceAttributes) {
                  this.accountDevice.attributes = accountDeviceAttributes;
                }
              }
              break;
            }

            case ApiEvents.Types.AccountDeviceRemoved: {
              const { account, address } = payload as ApiEvents.Payloads.IAccountDevice;
              if (
                this.account.ready &&
                account.ensName === this.account.ensName &&
                address === this.device.address
              ) {
                this.resetAccount();
              }
              break;
            }

            case ApiEvents.Types.SignedSecureAction: {
              try {
                const { signer, signature } = payload as ApiEvents.Payloads.ISignedSecureAction;

                if (!this.secureAction) {
                  return;
                }

                const { type, hash } = this.secureAction;

                if (signer !== recoverAddressFromPersonalMessage(hash, signature)) {
                  return;
                }

                switch (type) {
                  case LinkerActionsTypes.CreateAccountDevice:
                  case LinkerActionsTypes.DeployAccountDevice: {
                    const action: ILinkerAction<LinkerActionPayloads.ICreateAccountDevice> = {
                      type,
                      payload: {
                        network: {
                          version: this.network.version,
                        },
                        device: {
                          address: signer,
                        },
                      },
                      sender: {
                        type: LinkerActionSenderTypes.Device,
                        data: signer,
                      },
                    };

                    this.linker.incomingAction$.next(action);
                    break;
                  }
                }

              } finally {
                this.destroySecureAction();
              }
              break;
            }
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

  protected configureLinker(): void {
    this
      .linker
      .acceptedAction$
      .pipe(
        filter((action) => !!action),
        switchMap(({ type, payload, sender }) => from(this.error$.wrapTAsync(async () => {
          switch (type) {
            case LinkerActionsTypes.CreateAccountDevice: {
              if (this.account.ready) {
                const { network, device, app, limit } = payload as LinkerActionPayloads.ICreateAccountDevice;

                let accountDeviceAttributes = await this.api.getAccountDevice(this.account, device, true);

                if (!accountDeviceAttributes) {
                  accountDeviceAttributes = await this.api.createAccountDevice(
                    this.account,
                    device,
                    app || null,
                    limit || null,
                  );
                }

                if (sender) {
                  switch (sender.type) {
                    case LinkerActionSenderTypes.App: {
                      const { data } = sender as ILinkerActionSender<IAppAttributes>;
                      if (data && data.callbackUrl) {
                        const action: ILinkerAction<LinkerActionPayloads.IAccountDeviceCreated, IAppAttributes> = {
                          type: LinkerActionsTypes.AccountDeviceCreated,
                          payload: {
                            device,
                            account: {
                              ensName: this.account.ensName,
                            },
                            network,
                          },
                        };

                        const url = this.linker.buildActionUrl(action, {
                          senderType: LinkerActionSenderTypes.App,
                          toApp: data,
                        });

                        this.linker.outgoingUrl$.next(url);
                      }
                      break;
                    }
                  }
                }
              }
              break;
            }

            case LinkerActionsTypes.DeployAccountDevice: {
              if (this.account.ready) {
                const { device } = payload as LinkerActionPayloads.IDeployAccountDevice;

                const accountDeviceAttributes = await this.api.getAccountDevice(this.account, device);

                if (
                  accountDeviceAttributes &&
                  accountDeviceAttributes.state === AccountDeviceStates.Created &&
                  this.account.attributes.state === AccountStates.Deployed &&
                  this.accountDevice.attributes.state === AccountDeviceStates.Deployed
                ) {
                  await this.account.deployDevice(accountDeviceAttributes);
                }
              }
              break;
            }

            case LinkerActionsTypes.AccountDeviceCreated: {
              const { account, device } = payload as LinkerActionPayloads.IAccountDeviceCreated;
              if (!this.account.ready && device.address === this.device.address) {
                const accountAttributes = await this.api.getAccount(account);
                const accountDeviceAttributes = await this.api.getAccountDevice(account, device);

                if (accountAttributes && accountDeviceAttributes) {
                  this.account.attributes = accountAttributes;
                  this.accountDevice.attributes = accountDeviceAttributes;
                }
              }
              break;
            }

            case LinkerActionsTypes.Secure: {
              if (sender.type === LinkerActionSenderTypes.Device) {
                const { hash } = payload as LinkerActionPayloads.ISecure;
                const signature = await this.device.signPersonalMessage(hash);
                this.api.signSecureAction(sender.data, signature);
              }
              break;
            }
          }
        }))),
      )
      .subscribe();
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
