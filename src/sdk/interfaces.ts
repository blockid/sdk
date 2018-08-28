import { Subject } from "rxjs";
import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns } from "../ens";
import { IIdentity } from "../identity";
import { INetwork } from "../network";
import { IRegistry } from "../registry";
import { IStorageOptions } from "../storage";

export interface ISdk {
  error$: Subject<any>;
  api: IApi;
  device: IDevice;
  ens: IEns;
  identity: IIdentity;
  network: INetwork;
  registry: IRegistry;
}

export interface ISdkOptions {
  api: IApiOptions;
  storage: IStorageOptions;
}
