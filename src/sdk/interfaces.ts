import { IErrorSubject } from "rxjs-addons";
import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns, IEnsAttributes } from "../ens";
import { ILinker, ILinkerOptions } from "../linker";
import { INetwork, INetworkAttributes, INetworkOptions } from "../network";
import { IRegistry, IRegistryAttributes } from "../registry";
import { ISharedAccount, ISharedAccountOptions } from "../sharedAccount";
import { ISession, ISessionOptions } from "../session";
import { IStorageOptions } from "../storage";

export interface ISdk {
  error$: IErrorSubject;
  api: IApi;
  device: IDevice;
  ens: IEns;
  linker: ILinker;
  network: INetwork;
  registry: IRegistry;
  session: ISession;
  sharedAccount: ISharedAccount;
  configure(): Promise<ISdk>;
}

export interface ISdkOptions {
  api?: IApiOptions;
  linker?: ILinkerOptions;
  network?: INetworkOptions;
  session?: ISessionOptions;
  sharedAccount?: ISharedAccountOptions;
  storage?: IStorageOptions;
}

export interface ISdkSettings {
  ens: IEnsAttributes;
  network: INetworkAttributes;
  registry: IRegistryAttributes;
}
