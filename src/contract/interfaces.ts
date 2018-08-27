import { ILog } from "ethjs-abi";
import { IAbstractAddressHolder } from "../shared";

export interface IContract extends IAbstractAddressHolder {
  at(address: string): IContract;
  decodeLogs(logs: any[]): ILog[];
}
