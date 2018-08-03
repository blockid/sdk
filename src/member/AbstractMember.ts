import { BehaviorSubject } from "rxjs";
import { IMember } from "./interfaces";

/**
 * Abstract Member
 */
export abstract class AbstractMember implements IMember {

  /**
   * address$ subject
   */
  public readonly address$ = new BehaviorSubject<string>(null);

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
   * personal sign
   * @param data
   */
  abstract personalSign(data: Buffer | string): Promise<string>;
}