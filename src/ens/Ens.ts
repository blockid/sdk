import { INetwork } from "../network";
import { AbstractAttributesHolder } from "../shared";
import { IEns, IEnsAttributes, IEnsRecord, IEnsNode } from "./interfaces";
import {
  getEnsNameHash,
  getEnsNameInfo,
} from "./utils";
import { IEnsContract, IEnsResolverContract, EnsContract, EnsResolverContract } from "./contracts";

/**
 * Ens
 */
export class Ens extends AbstractAttributesHolder<IEnsAttributes> implements IEns {

  /**
   * creates
   * @param network
   * @param attributes
   */
  public static create(network: INetwork, attributes: IEnsAttributes = null): IEns {
    return new Ens(network, attributes);
  }

  private readonly contract: IEnsContract;

  private readonly resolverContract: IEnsResolverContract;

  /**
   * constructor
   * @param network
   * @param attributes
   */
  private constructor(private network: INetwork, attributes: IEnsAttributes) {
    super({
      supportedRootNodes: true,
    }, attributes);

    this.contract = new EnsContract(network);
    this.resolverContract = new EnsResolverContract(network);

    this.getAttribute$("address").subscribe(this.contract.address$);
    this.getAttribute$("resolverAddress").subscribe(this.resolverContract.address$);
  }

  /**
   * checks if root node is supported
   * @param rootNode
   */
  public isRootNodeSupported(rootNode: Partial<IEnsNode>): boolean {
    const { supportedRootNodes } = this.attributes;
    return rootNode && supportedRootNodes.some(({ name, nameHash }) => (
      name === rootNode.name ||
      nameHash === rootNode.nameHash
    ));
  }

  /**
   * lookup
   * @param name
   */
  public async lookup(name: string): Promise<IEnsRecord> {
    let result: IEnsRecord = null;

    const info = getEnsNameInfo(name);

    if (info) {

      const supported = this.isRootNodeSupported(info.rootNode);
      const nameHash = getEnsNameHash(name);

      let resolverContract: IEnsResolverContract = null;

      if (supported) {
        resolverContract = this.resolverContract;
      } else {
        const address = await this.contract.getResolverAddress(nameHash);

        if (address) {
          resolverContract = this.resolverContract.at(address);
        }
      }

      if (resolverContract) {
        result = {
          supported,
          address: await resolverContract.resolveAddress(nameHash),
          ...info,
        };
      }
    }

    return result;
  }

  protected prepareAttributes(attributes: IEnsAttributes): IEnsAttributes {
    return attributes ? attributes : {
      address: null,
      resolverAddress: null,
      supportedRootNodes: [],
    };
  }
}
