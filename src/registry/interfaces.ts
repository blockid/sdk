import { IAbstractOptionsHolder } from "../shared";

export interface IRegistry extends IAbstractOptionsHolder<IRegistryOptions> {
  createSelfIdentity(name: string): Promise<string>;
}

export interface IRegistryOptions {
  address: string;
}
