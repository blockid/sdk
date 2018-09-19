import { AttributesProxySubject } from "rxjs-addons";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryAttributes } from "./interfaces";
import { IRegistryContact, RegistryContact } from "./contracts";

/**
 * Registry
 */
export class Registry extends AttributesProxySubject<IRegistryAttributes> implements IRegistry {

  private static prepareAttributes(attributes: IRegistryAttributes): IRegistryAttributes {
    return {
      address: null,
      supportedEnsRootNodesNames: [],
      ...(attributes || {}),
    };
  }

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
    super(attributes, {
      schema: {
        supportedEnsRootNodesNames: true,
      },
      prepare: Registry.prepareAttributes,
    });

    this.contract = new RegistryContact(network, device);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }
}
