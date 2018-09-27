import { IBN } from "bn.js";
import { INetworkTransactionOptions } from "../network";
import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";

export interface IDevice extends IAttributesProxySubject<IDeviceAttributes> {
  address$?: TUniqueBehaviorSubject<string>;
  address?: string;
  getBalance(): Promise<IBN>;
  getTransactionCount(): Promise<IBN>;
  signPersonalMessage(message: Buffer | string): Promise<Buffer>;
  sendTransaction(options: INetworkTransactionOptions): Promise<string>;
}

export interface IDeviceAttributes {
  address?: string;
  publicKey?: Buffer;
  privateKey?: Buffer;
}
