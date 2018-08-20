import { BehaviorSubject } from "rxjs";
import { NetworkVersions } from "blockid-core";
import { NetworkStatuses } from "./constants";

export interface INetwork {
  version$: BehaviorSubject<NetworkVersions>;
  status$: BehaviorSubject<NetworkStatuses>;
  version: NetworkVersions;
  status: NetworkStatuses;
  setProvider(provider?: any): void;
  detectVersion(): Promise<NetworkVersions>;
  personalSign(message: Buffer | string, address: string): Promise<string>;
}
