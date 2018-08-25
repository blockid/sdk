import { Contract } from "../../contract";
import { IDevice } from "../../device";
import { INetwork } from "../../network";
import { IIdentityContact } from "./interfaces";
import abi from "./IdentityAbi";

/**
 * Identity contact
 */
export class IdentityContact extends Contract implements IIdentityContact {

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
   * @param address
   */
  public at(address: string): IIdentityContact {
    return new IdentityContact(this.network, this.device, address);
  }
}
