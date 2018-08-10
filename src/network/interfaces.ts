import { BehaviorSubject } from "rxjs";
import { NetworkVersions, NetworkStatuses } from "./constants";

export interface INetwork {
  version$: BehaviorSubject<NetworkVersions>;
  status$: BehaviorSubject<NetworkStatuses>;
  setProvider(provider: any): void;
  setVersion(version: NetworkVersions): void;
  getVersion(): NetworkVersions;
  setStatus(status: NetworkStatuses): void;
  getStatus(): NetworkStatuses;
  detectVersion(): Promise<NetworkVersions>;
  personalSign(message: Buffer | string, address: string): Promise<string>;
  getAccounts(): Promise<string[]>;
}
