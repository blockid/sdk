import { IAbstractAttributesHolder } from "../shared";

export interface IRegistry extends IAbstractAttributesHolder<IRegistryAttributes> {
  createSelfIdentity(name: string): Promise<string>;
}

export interface IRegistryAttributes {
  address: string;
}
