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
