import { TUniqueBehaviorSubject } from "../rx";

export interface IAbstractAddressHolder {
  address$: TUniqueBehaviorSubject<string>;
  address: string;
}
