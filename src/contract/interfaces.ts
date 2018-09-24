import { ILog, IResult } from "ethjs-abi";
import { TUniqueBehaviorSubject } from "rxjs-addons";

export interface IContract {
  address$: TUniqueBehaviorSubject<string>;
  address: string;
  at(address: string): IContract;
  decodeLogs(logs: any[]): ILog[];
  getMethodSignature(methodName: string): Buffer;
  encodeMethodInput(methodName: string, ...args: any[]): string;
  decodeMethodOutput<T = IResult>(methodName: string, data: string): T;
}

export interface IEnsContract extends IContract {
  getResolverAddress(nameHash: string): Promise<string>;
}

export interface IEnsResolverContract extends IContract {
  at(address: string): IEnsResolverContract;
  resolveAddress(nameHash: string): Promise<string>;
}

export interface IRegistryContact extends IContract {
  sharedAccountExists(
    sharedAccount: string,
  ): Promise<boolean>;

  createSharedAccount(
    salt: number,
    ensLabel: string,
    ensRootNode: string,
    memberMessageSignature: string,
    guardianMessageSignature: string,
  ): Promise<string>;
}

export interface ISharedAccountContact extends IContract {
  //
}
