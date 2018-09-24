import { IDevice } from "../device";
import { INetwork } from "../network";
import { Contract } from "./Contract";
import { ISharedAccountContact } from "./interfaces";
import { SharedAccountAbi } from "./abi";

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
    super(SharedAccountAbi, device, network, address);
  }
}
