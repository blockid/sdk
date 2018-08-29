import { IBN } from "bn.js";
import { INetworkTransactionOptions } from "../network";
import { IAbstractAttributesHolder, TUniqueBehaviorSubject } from "../shared";

export interface IDeviceAttributes {
  address?: string;
  publicKey?: Buffer;
  privateKey?: Buffer;
}

export interface IDevice extends IAbstractAttributesHolder<IDeviceAttributes> {
  address$?: TUniqueBehaviorSubject<string>;
  address?: string;
  publicKey?: Buffer;
  getBalance(): Promise<IBN>;
  getTransactionCount(): Promise<IBN>;
  signPersonalMessage(message: Buffer | string): Promise<Buffer>;
  sendTransaction(options: INetworkTransactionOptions): Promise<string>;
}
