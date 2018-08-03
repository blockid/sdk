import { INetwork } from "../network";
import { AbstractMember } from "./AbstractMember";

/**
 * Network Member
 */
export class NetworkMember extends AbstractMember {

  /**
   * constructor
   * @param network
   */
  constructor(private network: INetwork) {
    super();
  }

  /**
   * personal sign
   * @param message
   */
  public personalSign(message: Buffer | string): Promise<string> {
    return this.network.personalSign(message, this.address);
  }
}
