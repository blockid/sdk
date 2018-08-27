import { AbstractOptionsHolder } from "../shared";
import { IApi } from "../api";
import { getEnsNameInfo } from "../ens";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryOptions } from "./interfaces";
import { IRegistryContact, RegistryContact } from "./contracts";

/**
 * Registry
 */
export class Registry extends AbstractOptionsHolder<IRegistryOptions> implements IRegistry {

  private contract: IRegistryContact;

  /**
   * constructor
   * @param api
   * @param network
   * @param device
   * @param options
   */
  constructor(api: IApi, network: INetwork, device: IDevice, options: IRegistryOptions = null) {
    super(options);

    this.contract = new RegistryContact(network, device);

    this
      .options$
      .subscribe(({ address }) => {
        this.contract.address = address;
      });
  }

  /**
   * creates self identity
   * @param name
   */
  public createSelfIdentity(name: string): Promise<string> {
    const { labelHash, rootNode } = getEnsNameInfo(name);
    return this.contract.createSelfIdentity(labelHash, rootNode.nameHash);
  }

  protected prepareOptions(options: IRegistryOptions): IRegistryOptions {
    return options ? options : {
      address: null,
    };
  }
}
