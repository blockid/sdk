import { IBN } from "bn.js";
import { IContract } from "../../contract";

export interface IIdentityContact extends IContract {
  nonce: Promise<IBN>;
  at(address: string): IIdentityContact;
  addMember(address: string, purpose: string, limit: IBN, unlimited: boolean): Promise<string>;
}
