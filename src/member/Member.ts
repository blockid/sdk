import { BehaviorSubject } from "rxjs";
import { sign } from "secp256k1";
import { anyToHex, anyToBuffer, hashPersonalMessage, privateKeyToAddress } from "../utils";
import { INetwork } from "../network";
import { errMemberUndefinedAddress } from "../errors";
import { IMember, IMemberOptions } from "./interfaces";

/**
 * Member
 */
export class Member implements IMember {

  /**
   * address$ subject
   */
  public readonly address$ = new BehaviorSubject<string>(null);

  private privateKey: Buffer = null;

  /**
   * constructor
   * @param network
   * @param options
   */
  constructor(private network: INetwork, options: IMemberOptions = {}) {
    const { privateKey } = options;
    this.setPrivateKey(privateKey);
  }

  /**
   * gets address
   */
  public getAddress(): string {
    return this.address$.getValue();
  }

  /**
   * sets address
   * @param address
   */
  public setAddress(address: string) {
    if (this.getAddress() !== address) {
      this.address$.next(address);
    }
  }

  /**
   * sets private key
   * @param privateKey
   */
  public setPrivateKey(privateKey: Buffer | string = null): void {
    if (privateKey) {
      this.privateKey = anyToBuffer(privateKey);
      this.setAddress(privateKeyToAddress(this.privateKey));
    } else {
      this.privateKey = null;
      this.setAddress(null);
    }
  }

  /**
   * personal sign
   * @param message
   */
  public async personalSign(message: Buffer | string): Promise<string> {
    let result: string = null;

    if (!this.getAddress()) {
      throw errMemberUndefinedAddress;
    }

    if (this.privateKey) {
      const messageHash = hashPersonalMessage(message);
      const { signature, recovery } = sign(messageHash, this.privateKey);

      result = (
        anyToHex(signature, { add0x: true }) +
        anyToHex(recovery + 27, { length: 2 })
      );
    } else {
      result = await this.network.personalSign(message, this.getAddress());
    }

    return result;
  }
}
