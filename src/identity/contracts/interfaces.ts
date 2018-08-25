import { IContract } from "../../contract";

export interface IIdentityContact extends IContract {
  at(address: string): IIdentityContact;
}
