import { IContract } from "../../contract";

export interface IEnsContract extends IContract {
  getResolverAddress(nameHash: string): Promise<string>;
}

export interface IEnsResolverContract extends IContract {
  at(address: string): IEnsResolverContract;
  resolveAddress(nameHash: string): Promise<string>;
}
