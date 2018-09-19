import { IContract } from "../../contract";

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
