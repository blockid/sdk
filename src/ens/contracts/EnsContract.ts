import { prepareAddress } from "eth-utils";
import { Contract } from "../../contract";
import { INetwork } from "../../network";
import { IEnsContract } from "./interfaces";
import abi from "./EnsAbi";

/**
 * Ens contract
 */
export class EnsContract extends Contract implements IEnsContract {

  /**
   * constructor
   * @param network
   * @param address
   */
  constructor(network: INetwork, address: string = null) {
    super(abi, network, null, address);
  }

  /**
   * gets resolver address
   * @param nameHash
   */
  public async getResolverAddress(nameHash: string): Promise<string> {
    let result: string = null;

    const data = await this.call("resolver", nameHash);

    try {
      result = prepareAddress(data[ "0" ]);
    } catch (err) {
      result = null;
    }

    return result;
  }
}
