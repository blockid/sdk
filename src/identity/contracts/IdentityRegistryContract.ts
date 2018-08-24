import { Contract } from "../../contract";
import { IDevice } from "../../device";
import { INetwork, INetworkTransactionOptions } from "../../network";
import { IIdentityRegistryContract } from "./interfaces";
import abi from "./IdentityRegistryAbi";

/**
 * Identity registry contract
 */
export class IdentityRegistryContract extends Contract implements IIdentityRegistryContract {

  /**
   * constructor
   * @param network
   * @param device
   * @param address
   */
  constructor(network: INetwork, device: IDevice = null, address: string = null) {
    super(abi, network, device, address);
  }

  /**
   * gets self identity
   * @param labelHash
   * @param rootNodeNameHash
   * @param options
   */
  public createSelfIdentity(
    labelHash: string,
    rootNodeNameHash: string,
    options: Partial<INetworkTransactionOptions> = {},
  ): Promise<string> {
    return this.send("resolver", labelHash, rootNodeNameHash)({});
  }
}
