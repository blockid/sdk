/* tslint:disable:variable-name */

import { IBN } from "bn.js";
import { IProvider } from "ethjs";
import { TUniqueBehaviorSubject } from "../shared";
import { NetworkStatuses, NetworkVersions } from "./constants";

export interface INetworkProvider extends IProvider {
  endpoint$: TUniqueBehaviorSubject<string>;
  endpoint: string;
}

export interface INetwork {
  version$: TUniqueBehaviorSubject<NetworkVersions>;
  version: NetworkVersions;
  name$: TUniqueBehaviorSubject<string>;
  name: string;
  status$: TUniqueBehaviorSubject<NetworkStatuses>;
  status: NetworkStatuses;
  detectVersion(): Promise<NetworkVersions>;
  getPrimaryAccount(): Promise<string>;
  getBalance(target: any): Promise<IBN>;
  getTransactionCount(target: any): Promise<IBN>;
  getGasPrice(): Promise<IBN>;
  getBlockNumber(): Promise<IBN>;
  getBlock(number?: IBN): Promise<INetworkBlock>;
  getTransactionReceipt(hash: string): Promise<INetworkTransactionReceipt>;
  callMessage(options: INetworkMessageOptions): Promise<string>;
  sendTransaction(options: INetworkTransactionOptions): Promise<string>;
  estimateTransaction(options: Partial<INetworkTransactionOptions>): Promise<IBN>;
  sendRawTransaction(data: string | Buffer): Promise<string>;
  signPersonalMessage(message: string | Buffer, address: string): Promise<Buffer>;
}

export interface INetworkMessageOptions {
  to: string;
  data: string | Buffer;
}

export interface INetworkTransactionOptions {
  from?: string;
  to: string;
  value?: number | IBN;
  nonce?: number | IBN;
  gas?: number | IBN;
  gasPrice?: number | IBN;
  data?: string | Buffer;
}

export interface INetworkBlock {
  number: IBN;
  hash: string;
  transactions: INetworkBlockTransaction[];
}

export interface INetworkBlockTransaction {
  hash: string;
  from: string;
  to: string;
  nonce: IBN;
  value: IBN;
  gas: IBN;
  gasPrice: IBN;
  input: string;
}

export interface INetworkTransactionReceipt {
  cumulativeGasUsed: IBN;
  gasUsed: IBN;
  logs: any[];
  success: boolean;
}
