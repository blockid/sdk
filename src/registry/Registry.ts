import { AttributesProxySubject } from "rxjs-addons";
import { getEnsNameInfo, abiEncodePacked } from "eth-utils";
import { IRegistryContact, RegistryContact } from "../contract";
import { IApi } from "../api";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryAttributes } from "./interfaces";

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
   * @param api
   * @param device
   * @param network
   */
  constructor(private api: IApi, private device: IDevice, network: INetwork) {
    super(null, {
      schema: {
        supportedEnsRootNodesNames: true,
      },
      prepare: Registry.prepareAttributes,
    });

    this.contract = new RegistryContact(device, network);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * builds creation signature
   * @param accountEnsName
   */
  public async buildCreationSignature(accountEnsName: string): Promise<Buffer> {
    let result: Buffer = null;

    const accountEnsNameInfo = getEnsNameInfo(accountEnsName);

    if (
      accountEnsNameInfo &&
      accountEnsNameInfo.rootNode
    ) {
      const message = abiEncodePacked(
        "address",
        "uint256",
        "bytes32",
        "bytes32",
      )(
        this.getAttribute("address"),
        0,
        accountEnsNameInfo.labelHash,
        accountEnsNameInfo.rootNode.nameHash,
      );

      result = await this.device.signPersonalMessage(message);
    }

    return result;
  }
}
