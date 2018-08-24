import { ILog } from "ethjs-abi";
import { IAbstractAddressHolder } from "../shared";

export interface IContract extends IAbstractAddressHolder {
  decodeLogs(logs: any[]): ILog[];
}
