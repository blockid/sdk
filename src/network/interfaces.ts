import { BehaviorSubject } from "rxjs";
import { NetworkVersions } from "./constants";

export interface INetwork {
  version$: BehaviorSubject<NetworkVersions>;
  setProvider(provider: any): void;
  setVersion(version: NetworkVersions): void;
  getVersion(): NetworkVersions;
  detectVersion(): Promise<NetworkVersions>;
  personalSign(message: Buffer | string, address: string): Promise<string>;
  getAccounts(): Promise<string[]>;
}
