import { IBN } from "bn.js";
import { INetworkTransactionOptions } from "../network";
import { IAbstractAddressHolder } from "../shared";

export interface IDevice extends IAbstractAddressHolder {
  setPrivateKey(privateKey?: Buffer): void;
  signPersonalMessage(message: Buffer | string): Promise<Buffer>;
  getBalance(): Promise<IBN>;
  getTransactionCount(): Promise<IBN>;
  sendTransaction(options: INetworkTransactionOptions): Promise<string>;
}

export interface IDeviceOptions {
  privateKey?: Buffer;
}
