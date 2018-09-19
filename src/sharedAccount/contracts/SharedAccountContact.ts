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
   * @param network
   * @param device
   * @param address
   */
  constructor(network: INetwork = null, device: IDevice = null, address: string = null) {
    super(abi, network, device, address);
  }
}
