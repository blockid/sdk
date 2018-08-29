import { AbstractAttributesHolder } from "../shared";
import { IApi } from "../api";
import { getEnsNameInfo } from "../ens";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryAttributes } from "./interfaces";
import { IRegistryContact, RegistryContact } from "./contracts";

/**
 * Registry
 */
export class Registry extends AbstractAttributesHolder<IRegistryAttributes> implements IRegistry {

  /**
   * creates
   * @param api
   * @param network
   * @param device
   * @param attributes
   */
  public static create(api: IApi, network: INetwork, device: IDevice, attributes: IRegistryAttributes = null): IRegistry {
    return new Registry(api, network, device, attributes);
  }

  private contract: IRegistryContact;

  /**
   * constructor
   * @param api
   * @param network
   * @param device
   * @param attributes
   */
  private constructor(
    private api: IApi,
    network: INetwork,
    device: IDevice,
    attributes: IRegistryAttributes,
  ) {
    super({}, attributes);

    this.contract = new RegistryContact(network, device);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * creates self identity
   * @param name
   */
  public createSelfIdentity(name: string): Promise<string> {
    const { labelHash, rootNode } = getEnsNameInfo(name);
    return this.contract.createSelfIdentity(labelHash, rootNode.nameHash);
  }
}
