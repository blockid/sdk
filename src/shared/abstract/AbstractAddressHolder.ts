import { UniqueBehaviorSubject, TUniqueBehaviorSubject } from "../rx";
import { errUnknownAddress } from "./errors";
import { IAbstractAddressHolder } from "./interfaces";

/**
 * Abstract address holder
 */
export abstract class AbstractAddressHolder implements IAbstractAddressHolder {

  /**
   * address subject
   */
  public address$: TUniqueBehaviorSubject<string>;

  /**
   * constructor
   * @param address
   */
  protected constructor(address: string = null) {
    this.address$ = new UniqueBehaviorSubject<string>(address);
  }

  /**
   * address getter
   */
  public get address(): string {
    return this.address$.value;
  }

  /**
   * address setter
   * @param address
   */
  public set address(address: string) {
    this.address$.next(address);
  }

  /**
   * verifies address
   */
  protected verifyAddress(): void {
    if (!this.address) {
      throw errUnknownAddress;
    }
  }
}
