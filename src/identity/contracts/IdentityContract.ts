import * as BN from "bn.js";
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

  /**
   * nonce getter
   */
  public get nonce(): Promise<BN.IBN> {
    return (async () => {
      const data = await this.call("nonce");
      return data && BN.isBN(data[ "0" ]) ? data[ "0" ] : 0;
    })();
  }

  /**
   * adds member
   * @param address
   * @param purpose
   * @param limit
   * @param unlimited
   */
  public async addMember(address: string, purpose: string, limit: BN.IBN, unlimited: boolean): Promise<string> {
    const nonce = await this.nonce;
    const result = await this.send("addMember", nonce, address, purpose, limit, unlimited)({
      //
    });

    return result;
  }
}
