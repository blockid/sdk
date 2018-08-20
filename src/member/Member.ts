import { BehaviorSubject } from "rxjs";
import {
  anyToHex,
  anyToBuffer,
  signPersonalMessage,
  privateKeyToAddress,
} from "blockid-core";
import { INetwork } from "../network";
import { errMemberUndefinedAddress } from "./errors";
import { IMember } from "./interfaces";

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
   */
  constructor(private network: INetwork) {
    //
  }

  /**
   * address getter
   */
  public get address(): string {
    return this.address$.getValue();
  }

  /**
   * address setter
   * @param address
   */
  public set address(address: string) {
    if (this.address !== address) {
      this.address$.next(address);
    }
  }

  /**
   * restores from private key
   * @param privateKey
   */
  public restoreFromPrivateKey(privateKey: Buffer | string = null): void {
    if (privateKey) {
      this.privateKey = anyToBuffer(privateKey);
      this.address = privateKeyToAddress(this.privateKey);
    } else {
      this.privateKey = null;
      this.address = null;
    }
  }

  /**
   * personal sign
   * @param message
   */
  public async personalSign(message: Buffer | string): Promise<string> {
    let result: string = null;

    if (!this.address) {
      throw errMemberUndefinedAddress;
    }

    if (this.privateKey) {
      result = anyToHex(
        signPersonalMessage(message, this.privateKey), {
          add0x: true,
        });
    } else {
      result = await this.network.personalSign(message, this.address);
    }

    return result;
  }
}
