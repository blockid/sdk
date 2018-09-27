import { AttributesProxySubject } from "rxjs-addons";
import { getEnsNameInfo, abiEncodePacked, anyToHex } from "eth-utils";
import { IAccount } from "../account";
import { IRegistryContact, RegistryContact } from "../contract";
import { IApi } from "../api";
import { INetwork } from "../network";
import { IDevice } from "../device";
import { IRegistry, IRegistryAttributes } from "./interfaces";

/**
 * Registry
 */
export class Registry extends AttributesProxySubject<IRegistryAttributes> implements IRegistry {

  /**
   * prepares attributes
   * @param attributes
   */
  public static prepareAttributes(attributes: IRegistryAttributes = null): IRegistryAttributes {
    return {
      address: null,
      supportedEnsRootNodesNames: [],
      ...(attributes || {}),
    };
  }

  private contract: IRegistryContact;

  /**
   * constructor
   * @param account
   * @param api
   * @param device
   * @param network
   */
  constructor(private account: IAccount, private api: IApi, private device: IDevice, network: INetwork) {
    super(null, {
      schema: {},
      prepare: Registry.prepareAttributes,
    });

    this.contract = new RegistryContact(device, network);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * builds account deployment signature
   */
  public async buildAccountDeploymentSignature(): Promise<Buffer> {
    let result: Buffer = null;

    const accountEnsNameInfo = getEnsNameInfo(this.account.ensName);

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
        this.account.salt,
        accountEnsNameInfo.labelHash,
        accountEnsNameInfo.rootNode.nameHash,
      );

      result = await this.device.signPersonalMessage(message);
    }

    return result;
  }

  /**
   * deploys account
   * @param deviceSignature
   * @param guardianSignature
   */
  public async deployAccount(deviceSignature: Buffer, guardianSignature: Buffer): Promise<boolean> {
    let result: boolean = false;

    const accountEnsNameInfo = getEnsNameInfo(this.account.ensName);

    if (
      accountEnsNameInfo &&
      accountEnsNameInfo.rootNode &&
      deviceSignature &&
      guardianSignature
    ) {
      const hash = await this.contract.createSharedAccount(
        this.account.salt,
        accountEnsNameInfo.labelHash,
        accountEnsNameInfo.rootNode.nameHash,
        anyToHex(deviceSignature, { add0x: true }),
        anyToHex(guardianSignature, { add0x: true }),
      );

      result = !!hash;
    }

    return result;
  }
}
