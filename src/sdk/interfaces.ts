import { IApi, IApiOptions } from "../api";
import { IDevice } from "../device";
import { IEns } from "../ens";
import { IIdentity } from "../identity";
import { ILinker, ILinkerApp, ILinkerOptions, LinkerActionsTypes } from "../linker";
import { INetwork } from "../network";
import { IRegistry } from "../registry";
import { IStorageOptions } from "../storage";
import { TUniqueBehaviorSubject, IErrorSubject } from "../shared";
import { TSdkSettings } from "./types";

export interface ISdk {
  settings$: TUniqueBehaviorSubject<TSdkSettings>;
  error$: IErrorSubject;
  authAction$: TUniqueBehaviorSubject<ISdkAuthAction>;
  authAction: ISdkAuthAction;
  api: IApi;
  device: IDevice;
  ens: IEns;
  linker: ILinker;
  identity: IIdentity;
  network: INetwork;
  registry: IRegistry;
  signAndVerifyApiSession(): void;
  muteSession(): void;
  unMuteSession(): void;
  createSelfIdentity(name: string): Promise<boolean>;
  signInToIdentity(name: string, toApp?: ILinkerApp): Promise<string>;
  activateAuthAction(authAction: Partial<ISdkAuthAction>): string;
  deactivateAuthAction(): void;
}

export interface ISdkOptions {
  api: IApiOptions;
  linker?: ILinkerOptions;
  storage: IStorageOptions;
}

export interface ISdkAuthAction<T = any> {
  type: LinkerActionsTypes;
  hash: Buffer;
  payload: T;
}
