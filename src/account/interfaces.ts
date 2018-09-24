import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";
import { AccountStates } from "./constants";

export interface IAccount extends IAttributesProxySubject<IAccountAttributes> {
  address?: string;
  address$?: TUniqueBehaviorSubject<string>;
  ensName?: string;
  ensName$?: TUniqueBehaviorSubject<string>;
  state?: AccountStates;
  state$?: TUniqueBehaviorSubject<AccountStates>;
}

export interface IAccountOptions {
  useGasRelay: boolean;
}

export interface IAccountAttributes {
  address?: string;
  ensName: string;
  state: AccountStates;
}
