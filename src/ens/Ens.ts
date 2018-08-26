import { INetwork } from "../network";
import { UniqueBehaviorSubject, AbstractAddressHolder } from "../shared";
import { IEns, IEnsNode, IEnsRecord } from "./interfaces";
import {
  getEnsNameHash,
  getEnsNameInfo,
} from "./utils";
import { IEnsContract, IEnsResolverContract, EnsContract, EnsResolverContract } from "./contracts";

/**
 * Ens
 */
export class Ens extends AbstractAddressHolder implements IEns {

  /**
   * resolver address subject
   */
  public resolverAddress$ = new UniqueBehaviorSubject<string>();

  /**
   * supported root nodes subject
   */
  public supportedRootNodes$ = new UniqueBehaviorSubject<IEnsNode[]>([]);

  private readonly contract: IEnsContract;
  private readonly resolverContract: IEnsResolverContract;

  /**
   * constructor
   * @param network
   */
  constructor(private network: INetwork) {
    super();

    this.contract = new EnsContract(network);
    this.resolverContract = new EnsResolverContract(network);

    this.address$.subscribe(this.contract.address$);
    this.resolverAddress$.subscribe(this.resolverContract.address$);
  }

  /**
   * resolver address getter
   */
  public get resolverAddress(): string {
    return this.resolverAddress$.value;
  }

  /**
   * registry address setter
   * @param resolverAddress
   */
  public set resolverAddress(resolverAddress: string) {
    this.resolverAddress$.next(resolverAddress || null);
  }

  /**
   * supported root nodes getter
   */
  public get supportedRootNodes(): IEnsNode[] {
    return this.supportedRootNodes$.value;
  }

  /**
   * supported root nodes setter
   * @param supportedRootNodes
   */
  public set supportedRootNodes(supportedRootNodes: IEnsNode[]) {
    this.supportedRootNodes$.next(supportedRootNodes || []);
  }

  /**
   * lookup
   * @param name
   */
  public async lookup(name: string): Promise<IEnsRecord> {
    let result: IEnsRecord = null;

    const info = getEnsNameInfo(name);

    if (info) {

      const supported = this.supportedRootNodes.some(({ name }) => name === info.rootNode.name);
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
}
