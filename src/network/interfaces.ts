/* tslint:disable:variable-name */

import { IBN } from "bn.js";
import { IProvider } from "ethjs";
import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";
import { NetworkStates, NetworkTypes } from "./constants";

export interface INetwork extends IAttributesProxySubject<INetworkAttributes> {
  version$?: TUniqueBehaviorSubject<number>;
  version?: number;
  name$?: TUniqueBehaviorSubject<string>;
  name?: string;
  type$?: TUniqueBehaviorSubject<NetworkTypes>;
  type?: NetworkTypes;
  state$?: TUniqueBehaviorSubject<NetworkStates>;
  state?: NetworkStates;
  detectType(): Promise<NetworkTypes>;
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

export interface INetworkAttributes {
  version?: number;
  name?: string;
  type?: NetworkTypes;
  state?: NetworkStates;
  providerEndpoint?: string;
}

export interface INetworkOptions {
  customProvider?: IProvider;
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
