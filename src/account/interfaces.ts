import { IBN } from "bn.js";
import { IAttributesProxySubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { IDeviceAttributes } from "../device";
import { AccountStates, AccountDeviceStates } from "./constants";

export interface IAccount extends IAttributesProxySubject<IAccountAttributes> {
  salt?: number;
  ensName?: string;
  updateLocalAttributes(attributes: Partial<IAccountAttributes>): void;
}

export interface IAccountOptions {
  useGasRelay: boolean;
}

export interface IAccountAttributes {
  salt: number;
  state: AccountStates;
  address?: string;
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
