import { AttributesProxySubject } from "rxjs-addons";
import { IDevice } from "../device";
import { ApiSessionStates } from "./constants";
import { IApiSession, IApiSessionAttributes } from "./interfaces";

/**
 * Api session
 */
export class ApiSession extends AttributesProxySubject<IApiSessionAttributes> implements IApiSession {

  private static prepareAttributes(attributes: IApiSessionAttributes): IApiSessionAttributes {
    let result: IApiSessionAttributes = {
      state: ApiSessionStates.Destroyed,
      token: null,
    };

    if (attributes) {
      result = {
        ...result,
        ...attributes,
      };
    }

    return result;
  }

  /**
   * constructor
   * @param device
   */
  constructor(private device: IDevice) {
    super(null, {
      schema: {
        state: true,
        token: {
          setter: true,
          getter: true,
        },
      },
      prepare: ApiSession.prepareAttributes,
    });
  }

  /**
   * verified getter
   */
  public get verified(): boolean {
    return this.getAttribute("state") === ApiSessionStates.Verified;
  }

  /**
   * signs hash
   * @param hash
   */
  public async signHash(hash: Buffer): Promise<{
    signer: string;
    signature: Buffer;
  }> {
    const signer = this.device.address;
    const signature = await this.device.signPersonalMessage(hash);

    return {
      signer,
      signature,
    };
  }

  /**
   * sets as verifying
   * @param token
   */
  public setAsVerifying(token: string = null): void {
    this.attributes = {
      token,
      state: ApiSessionStates.Verifying,
    };
  }

  /**
   * sets as verified
   * @param token
   */
  public setAsVerified(token: string): void {
    this.attributes = {
      token,
      state: ApiSessionStates.Verified,
    };
  }

  /**
   * sets as destroyed
   */
  public setAsDestroyed(): void {
    this.attributes = null;
  }
}
