import { IAbstractAttributesHolder } from "../shared";

export interface IRegistry extends IAbstractAttributesHolder<IRegistryAttributes> {
  createSelfIdentity(labelHash: string, rootNodeNameHash: string): Promise<string>;
}

export interface IRegistryAttributes {
  address: string;
}
