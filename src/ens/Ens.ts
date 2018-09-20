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
   */
  constructor(private network: INetwork) {
    super(null, {
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
   * @param useOwnResolver
   */
  public async lookup(name: string, useOwnResolver = false): Promise<IEnsRecord> {
    let result: IEnsRecord = null;

    const info = getEnsNameInfo(name);

    if (info) {
      result = {
        address: null,
        ...info,
      };

      const nameHash = getEnsNameHash(name);

      let resolver: IEnsResolverContract = null;

      if (useOwnResolver) {
        resolver = this.resolverContract;
      } else {
        const address = await this.contract.getResolverAddress(nameHash);
        if (address) {
          resolver = this.resolverContract.at(address);
        }
      }

      if (resolver) {
        result.address = await resolver.resolveAddress(nameHash);
      }
    }

    return result;
  }
}
