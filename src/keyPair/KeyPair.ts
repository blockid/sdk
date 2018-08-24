import {
  privateKeyVerify,
  publicKeyVerify,
  publicKeyCreate,
  publicKeyConvert,
  recover,
  sign,
} from "secp256k1";
import {
  UniqueBehaviorSubject,
  AbstractAddressHolder,
  anyToBuffer,
  anyToHex,
  prepareHex,
  sha3,
  hashPersonalMessage,
} from "../shared";
import { IKeyPair, IKeyPairOptions } from "./interfaces";
import {
  errKeyPairInvalidSignature,
  errKeyPairUndefinedPrivateKey,
} from "./errors";

/**
 * Key Pair
 */
export class KeyPair extends AbstractAddressHolder implements IKeyPair {

  /**
   * recovers from personal message
   * @param message
   * @param signature
   */
  public static recoverFromPersonalMessage(message: Buffer | string, signature: Buffer | string): IKeyPair {
    const hash = hashPersonalMessage(message);
    const signatureBuff = anyToBuffer(signature);
    const s = signatureBuff.slice(0, -1);
    const r = signatureBuff[ signatureBuff.length - 1 ] - 27;

    let result: IKeyPair = null;

    try {
      const publicKey = recover(
        hash,
        s,
        r,
        false,
      );

      const keyPair = new KeyPair({
        publicKey,
      });

      result = keyPair.address ? keyPair : null;
    } catch (err) {
      result = null;
    }

    if (!result) {
      throw errKeyPairInvalidSignature;
    }

    return result;
  }

  /**
   * public kay subject
   */
  public publicKey$ = new UniqueBehaviorSubject<Buffer>();

  /**
   * can sign subject
   */
  public canSign$ = new UniqueBehaviorSubject<boolean>();

  private privateKey: Buffer = null;

  /**
   * constructor
   * @param options
   */
  constructor(options: IKeyPairOptions = {}) {
    super();
    this.update(options);
  }

  /**
   * public key getter
   */
  public get publicKey(): Buffer {
    return this.publicKey$.value;
  }

  /**
   * public key setter
   * @param publicKey
   */
  public set publicKey(publicKey: Buffer) {
    this.publicKey$.next(publicKey || null);
  }

  /**
   * can sign getter
   */
  public get canSign(): boolean {
    return this.canSign$.value;
  }

  /**
   * can sign setter
   * @param canSign
   */
  public set canSign(canSign: boolean) {
    this.canSign$.next(!!canSign);
  }

  /**
   * updates
   * @param options
   */
  public update({ address, publicKey, privateKey }: IKeyPairOptions = {}): void {
    if (
      privateKey &&
      privateKeyVerify(privateKey)
    ) {
      this.privateKey = privateKey;
      publicKey = publicKeyCreate(privateKey, false);
    } else {
      this.privateKey = null;
    }

    this.canSign = !!this.privateKey;

    if (
      publicKey &&
      publicKeyVerify(publicKey)
    ) {
      publicKey = publicKeyConvert(publicKey, false);
      address = anyToHex(sha3(publicKey.slice(1)).slice(-20), {});
      this.publicKey = publicKey;
    } else {
      this.publicKey = null;
    }

    this.address = address
      ? prepareHex(address, {
        add0x: true,
      })
      : null;
  }

  /**
   * signs personal message
   * @param message
   */
  public signPersonalMessage(message: Buffer | string): Buffer {
    this.verifyPrivateKey();

    const hash = hashPersonalMessage(message);
    const { recovery, signature } = sign(hash, this.privateKey);

    return Buffer.from([
      anyToBuffer(recovery + 27),
      signature,
    ]);
  }

  private verifyPrivateKey(): void {
    if (!this.privateKey) {
      throw errKeyPairUndefinedPrivateKey;
    }
  }
}
