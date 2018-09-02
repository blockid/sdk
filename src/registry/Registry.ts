import { AbstractAttributesHolder } from "../shared";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryAttributes } from "./interfaces";
import { IRegistryContact, RegistryContact } from "./contracts";

/**
 * Registry
 */
export class Registry extends AbstractAttributesHolder<IRegistryAttributes> implements IRegistry {

  private contract: IRegistryContact;

  /**
   * constructor
   * @param network
   * @param device
   * @param attributes
   */
  constructor(
    network: INetwork,
    device: IDevice,
    attributes: IRegistryAttributes = null,
  ) {
    super({}, attributes);

    this.contract = new RegistryContact(network, device);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * creates self identity
   * @param labelHash
   * @param rootNodeNameHash
   */
  public createSelfIdentity(labelHash: string, rootNodeNameHash: string): Promise<string> {
    return this.contract.createSelfIdentity(labelHash, rootNodeNameHash);
  }
}
