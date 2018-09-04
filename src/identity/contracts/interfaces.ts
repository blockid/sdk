import { IBN } from "bn.js";
import { IContract } from "../../contract";

export interface IIdentityContact extends IContract {
  balance: Promise<IBN>;
  nonce: Promise<IBN>;
  at(address: string): IIdentityContact;
  addMember(nonce: IBN, address: string, purpose: string, limit: IBN, unlimited: boolean): Promise<string>;
}
