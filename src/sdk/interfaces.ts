import { IErrorSubject } from "rxjs-addons";
import { IAccount, IAccountOptions } from "../account";
import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns, IEnsAttributes } from "../ens";
import { ILinker, ILinkerOptions } from "../linker";
import { INetwork, INetworkAttributes, INetworkOptions } from "../network";
import { IRegistry, IRegistryAttributes } from "../registry";
import { IStorageOptions } from "../storage";

export interface ISdk {
  error$: IErrorSubject;
  account: IAccount;
  api: IApi;
  device: IDevice;
  ens: IEns;
  linker: ILinker;
  network: INetwork;
  registry: IRegistry;
  configure(): Promise<ISdk>;
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
