import { IContract } from "../../contract";
import { INetworkTransactionOptions } from "../../network";

export interface IIdentityRegistryContract extends IContract {
  createSelfIdentity(
    labelHash: string,
    rootNodeNameHash: string,
    options?: Partial<INetworkTransactionOptions>,
  ): Promise<string>;
}
