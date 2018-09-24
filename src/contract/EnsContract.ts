import { prepareAddress } from "eth-utils";
import { INetwork } from "../network";
import { Contract } from "./Contract";
import { IEnsContract } from "./interfaces";
import { EnsAbi } from "./abi";

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
    super(EnsAbi, null, network, address);
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
