import { Subject } from "rxjs";
import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns } from "../ens";
import { IIdentity } from "../identity";
import { ILinker, ILinkerOptions } from "../linker";
import { INetwork } from "../network";
import { IRegistry } from "../registry";
import { IStorageOptions } from "../storage";
import { TUniqueBehaviorSubject } from "../shared";
import { TSdkSettings } from "./types";

export interface ISdk {
  settings$: TUniqueBehaviorSubject<TSdkSettings>;
  error$: Subject<any>;
  api: IApi;
  device: IDevice;
  ens: IEns;
  linker: ILinker;
  identity: IIdentity;
  network: INetwork;
  registry: IRegistry;
}

export interface ISdkOptions {
  api: IApiOptions;
  linker: ILinkerOptions;
  storage: IStorageOptions;
}

export interface ISdkError extends Subject<any> {
  wrapAsync(promise: Promise<any>): void;
  wrapTAsync<T = any>(promise: Promise<T>): Promise<T>;
}
