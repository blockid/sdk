import { prepareAddress } from "eth-utils";
import { Contract } from "../../contract";
import { INetwork } from "../../network";
import { IEnsResolverContract } from "./interfaces";
import abi from "./EnsResolverAbi";

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
    super(abi, null, network, address);
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
