import { IContract } from "../../contract";

export interface IRegistryContact extends IContract {
  createSelfIdentity(labelHash: string, rootNodeNameHash: string): Promise<string>;
}
