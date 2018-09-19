import { AttributesProxySubject } from "rxjs-addons";
import {
  getEnsNameHash,
  getEnsNameInfo,
} from "eth-utils";
import { INetwork } from "../network";
import { IEns, IEnsAttributes, IEnsRecord } from "./interfaces";
import { IEnsContract, IEnsResolverContract, EnsContract, EnsResolverContract } from "./contracts";

/**
 * Ens
 */
export class Ens extends AttributesProxySubject<IEnsAttributes> implements IEns {

  private readonly contract: IEnsContract;

  private readonly resolverContract: IEnsResolverContract;

  /**
   * constructor
   * @param network
   * @param attributes
   */
  constructor(private network: INetwork, attributes: IEnsAttributes = null) {
    super(attributes, {
      schema: {},
    });

    this.contract = new EnsContract(network);
    this.resolverContract = new EnsResolverContract(network);

    this.getAttribute$("address").subscribe(this.contract.address$);
    this.getAttribute$("resolverAddress").subscribe(this.resolverContract.address$);
  }

  /**
   * lookup
   * @param name
   */
  public async lookup(name: string): Promise<IEnsRecord> {
    let result: IEnsRecord = null;

    const info = getEnsNameInfo(name);

    if (info) {
      result = {
        address: null,
        ...info,
      };

      const nameHash = getEnsNameHash(name);
      const address = await this.contract.getResolverAddress(nameHash);

      if (address) {
        const resolverContract = this.resolverContract.at(address);
        result.address = await resolverContract.resolveAddress(nameHash);
      }
    }

    return result;
  }
}
