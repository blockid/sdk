import { Contract } from "../../contract";
import { IDevice } from "../../device";
import { INetwork } from "../../network";
import { IRegistryContact } from "./interfaces";
import abi from "./RegistryAbi";

/**
 * Registry contact
 */
export class RegistryContact extends Contract implements IRegistryContact {

  /**
   * constructor
   * @param device
   * @param network
   * @param address
   */
  constructor(device: IDevice = null, network: INetwork = null, address: string = null) {
    super(abi, device, network, address);
  }

  /**
   * shared account exists
   * @param sharedAccount
   */
  public async sharedAccountExists(sharedAccount: string): Promise<boolean> {
    const result = await this.call("sharedAccountExists", sharedAccount);

    return !!result[ "0" ];
  }

  /**
   * creates shared account
   * @param salt
   * @param ensLabel
   * @param ensRootNode
   * @param memberMessageSignature
   * @param guardianMessageSignature
   */
  public createSharedAccount(
    salt: number,
    ensLabel: string,
    ensRootNode: string,
    memberMessageSignature: string,
    guardianMessageSignature: string,
  ): Promise<string> {
    return this.send("createSharedAccount", salt, ensLabel, ensRootNode, memberMessageSignature, guardianMessageSignature)();
  }
}
