import { prepareAddress } from "eth-utils";
import { INetwork } from "../network";
import { Contract } from "./Contract";
import { IEnsResolverContract } from "./interfaces";
import { EnsResolverAbi } from "./abi";

/**
 * Ens resolver contract
 */
export class EnsResolverContract extends Contract implements IEnsResolverContract {

  /**
   * constructor
   * @param network
   * @param address
   */
  constructor(network: INetwork, address: string = null) {
    super(EnsResolverAbi, null, network, address);
  }

  /**
   * at
   * @param address
   */
  public at(address: string): IEnsResolverContract {
    return new EnsResolverContract(this.network, address);
  }

  /**
   * resolves address
   * @param nameHash
   */
  public async resolveAddress(nameHash: string): Promise<string> {
    let result: string = null;

    const data = await this.call("addr", nameHash);

    try {
      result = prepareAddress(data[ "0" ]);
    } catch (err) {
      result = null;
    }

    return result;
  }
}
