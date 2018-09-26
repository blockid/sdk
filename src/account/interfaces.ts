import { IBN } from "bn.js";
import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { IDeviceAttributes } from "../device";
import { AccountStates, AccountDeviceStates } from "./constants";

export interface IAccount extends IAttributesProxySubject<IAccountAttributes> {
  state?: AccountStates;
  state$?: TUniqueBehaviorSubject<AccountStates>;
  address?: string;
  address$?: TUniqueBehaviorSubject<string>;
  ensName?: string;
  ensName$?: TUniqueBehaviorSubject<string>;
  verify(): Promise<void>;
}

export interface IAccountOptions {
  useGasRelay: boolean;
}

export interface IAccountAttributes {
  salt?: number;
  state: AccountStates;
  address?: string;
  ensName: string;
  deviceMessageSignature?: Buffer;
  guardianMessageSignature?: Buffer;
  updatedAt?: Date;
}

export interface IAccountDeviceAttributes {
  state: AccountDeviceStates;
  app: IAppAttributes;
  device: IDeviceAttributes;
  limit: IBN;
  updatedAt: Date;
}
