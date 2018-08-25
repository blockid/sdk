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
   * @param network
   * @param device
   * @param address
   */
  constructor(network: INetwork = null, device: IDevice = null, address: string = null) {
    super(abi, network, device, address);
  }

  /**
   * at
   * @param labelHash
   * @param rootNodeNameHash
   */
  public createSelfIdentity(labelHash: string, rootNodeNameHash: string): Promise<string> {
    return this.send("createSelfIdentity", labelHash, rootNodeNameHash)({
      //
    });
  }
}
