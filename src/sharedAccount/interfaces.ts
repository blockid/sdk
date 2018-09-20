import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";
import { SharedAccountStates } from "./constants";

export interface ISharedAccount extends IAttributesProxySubject<ISharedAccountAttributes> {
  address?: string;
  address$?: TUniqueBehaviorSubject<string>;
  ensName?: string;
  ensName$?: TUniqueBehaviorSubject<string>;
  state?: SharedAccountStates;
  state$?: TUniqueBehaviorSubject<SharedAccountStates>;
}

export interface ISharedAccountOptions {
  useGasRelay: boolean;
}

export interface ISharedAccountAttributes {
  address?: string;
  ensName: string;
  state: SharedAccountStates;
}
