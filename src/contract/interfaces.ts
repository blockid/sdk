import { ILog } from "ethjs-abi";
import { TUniqueBehaviorSubject } from "../shared";

export interface IContract {
  address$: TUniqueBehaviorSubject<string>;
  address: string;
  at(address: string): IContract;
  decodeLogs(logs: any[]): ILog[];
}
