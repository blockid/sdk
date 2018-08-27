import { TUniqueBehaviorSubject } from "../rx";

export interface IAbstractAddressHolder {
  address$: TUniqueBehaviorSubject<string>;
  address: string;
}

export interface IAbstractOptionsHolder<T> {
  options$: TUniqueBehaviorSubject<T>;
  options: T;
}
