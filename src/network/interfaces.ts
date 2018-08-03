import { BehaviorSubject } from "rxjs";
import { NetworkVersions } from "./constants";

export interface INetworkOptions {
  version?: NetworkVersions;
  endpoints?: {[key: string]: string};
}

export interface INetwork {
  provider: any;
  version$: BehaviorSubject<NetworkVersions>;
  version: NetworkVersions;
  detectVersion(): Promise<void>;
  personalSign(message: Buffer | string, address: string): Promise<string>;
  getAccounts(): Promise<string[]>;
}
