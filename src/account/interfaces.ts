import { IBN } from "bn.js";
import { IAttributesProxySubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { IDeviceAttributes } from "../device";
import { AccountStates, AccountDeviceStates } from "./constants";

export interface IAccount extends IAttributesProxySubject<IAccountAttributes> {
  salt?: number;
  balance?: IBN;
  ensName?: string;
  ready: boolean;
  updateLocalAttributes(attributes: Partial<IAccountAttributes>): void;
  revertLocalAttributes(): void;
  deployDevice(accountDevice: IAccountDeviceAttributes): Promise<void>;
}

export interface IAccountDevice extends IAttributesProxySubject<IAccountDeviceAttributes> {
  limit?: IBN;
}

export interface IAccountOptions {
  useGasRelay: boolean;
}

export interface IAccountAttributes {
  salt: number;
  state: AccountStates;
  address?: string;
  balance: IBN;
  ensName: string;
  updatedAt?: Date;
}

export interface IAccountDeviceAttributes {
  state: AccountDeviceStates;
  app: IAppAttributes;
  device: IDeviceAttributes;
  limit: IBN;
  updatedAt: Date;
}
