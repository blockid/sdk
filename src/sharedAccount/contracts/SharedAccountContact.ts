import { Contract } from "../../contract";
import { IDevice } from "../../device";
import { INetwork } from "../../network";
import { ISharedAccountContact } from "./interfaces";
import abi from "./SharedAccountAbi";

/**
 * Shared account contact
 */
export class SharedAccountContact extends Contract implements ISharedAccountContact {

  /**
   * constructor
   * @param device
   * @param network
   * @param address
   */
  constructor(device: IDevice = null, network: INetwork = null, address: string = null) {
    super(abi, device, network, address);
  }
}
