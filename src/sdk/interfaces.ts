import { IErrorSubject } from "rxjs-addons";
import { IAccount, IAccountOptions, IAccountDevice } from "../account";
import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns, IEnsAttributes } from "../ens";
import { ILinker, ILinkerOptions, ILinkerActionUrls, LinkerActionsTypes } from "../linker";
import { INetwork, INetworkAttributes, INetworkOptions } from "../network";
import { IRegistry, IRegistryAttributes } from "../registry";
import { IStorageOptions } from "../storage";

export interface ISdk {
  error$: IErrorSubject;
  account: IAccount;
  accountDevice: IAccountDevice;
  api: IApi;
  device: IDevice;
  ens: IEns;
  linker: ILinker;
  network: INetwork;
  registry: IRegistry;
  configure(): Promise<ISdk>;
  createApiSession(): Promise<void>;
  destroyApiSession(): void;
  muteApiConnection(): void;
  unMuteApiConnection(): void;
  accountExists(accountEnsName: string): Promise<boolean>;
  joinAccount(accountEnsName: string): Promise<ILinkerActionUrls>;
  createAccount(accountEnsName: string): Promise<void>;
  deployAccount(): Promise<void>;
  resetAccount(): void;
  createSecureActionUrl(type: LinkerActionsTypes): string;
  destroySecureAction(): void;
}

export interface ISdkOptions {
  account?: IAccountOptions;
  api?: IApiOptions;
  linker?: ILinkerOptions;
  network?: INetworkOptions;
  storage?: IStorageOptions;
}

export interface ISdkSettings {
  ens: IEnsAttributes;
  network: INetworkAttributes;
  registry: IRegistryAttributes;
}

export interface ISdkSecureAction {
  type: LinkerActionsTypes;
  hash: Buffer;
}
