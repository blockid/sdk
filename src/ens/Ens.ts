import { INetwork } from "../network";
import { AbstractOptionsHolder } from "../shared";
import { IEns, IEnsOptions, IEnsRecord, IEnsNode } from "./interfaces";
import {
  getEnsNameHash,
  getEnsNameInfo,
} from "./utils";
import { IEnsContract, IEnsResolverContract, EnsContract, EnsResolverContract } from "./contracts";

/**
 * Ens
 */
export class Ens extends AbstractOptionsHolder<IEnsOptions> implements IEns {

  private readonly contract: IEnsContract;
  private readonly resolverContract: IEnsResolverContract;

  /**
   * constructor
   * @param network
   * @param options
   */
  constructor(private network: INetwork, options: IEnsOptions = null) {
    super(options);

    this.contract = new EnsContract(network);
    this.resolverContract = new EnsResolverContract(network);

    this
      .options$
      .subscribe(({ address, resolverAddress }) => {
        this.contract.address = address;
        this.resolverContract.address = resolverAddress;
      });
  }

  /**
   * checks if root node is supported
   * @param rootNode
   */
  public isRootNodeSupported(rootNode: Partial<IEnsNode>): boolean {
    return rootNode && this.options.supportedRootNodes.some(({ name, nameHash }) => (
      name === rootNode.name ||
      nameHash === rootNode.nameHash
    ));
  }

  /**
   * lookup
   * @param name
   */
  public async lookup(name: string): Promise<IEnsRecord> {
    this.verifyOptions();

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

  protected prepareOptions(options: IEnsOptions): IEnsOptions {
    return options ? options : {
      address: null,
      resolverAddress: null,
      supportedRootNodes: [],
    };
  }
}
