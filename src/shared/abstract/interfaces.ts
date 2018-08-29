import { TUniqueBehaviorSubject } from "../rx";

export interface IAbstractAttributesHolder<T> {
  attributes$: TUniqueBehaviorSubject<Partial<T>>;
  attributes: Partial<T>;
}

export interface IAttributeOptions {
  subject: boolean;
  getter: boolean;
  setter: boolean;
}
