import { sign } from "secp256k1";
import { generatePrivateKey, privateKeyToAddress, anyToHex, hashPersonalMessage } from "../utils";
import { INetwork } from "../network";
import { IStorage } from "../interfaces";
import { AbstractMember } from "./AbstractMember";

/**
 * KeyPair Member
 */
export class KeyPairMember extends AbstractMember {
  private privateKey: Buffer = null;

  /**
   * constructor
   * @param network
   * @param storage
   */
  constructor(private network: INetwork, private storage: IStorage<Buffer> = null) {
    super();
  }

  /**
   * personal sign
   * @param message
   */
  public async personalSign(message: Buffer | string): Promise<string> {
    const messageHash = hashPersonalMessage(message);
    const { signature, recovery } = sign(messageHash, this.privateKey);

    return (
      anyToHex(signature, { add0x: true }) +
      anyToHex(recovery + 27, { length: 2 })
    );
  }

  /**
   * restores privateKey
   * @param path
   */
  public async restorePrivateKey(...path: string[]): Promise<boolean> {
    if (!this.storage) {
      throw new Error("Undefined storage");
    }

    this.setPrivateKey(await Promise.resolve(this.storage.get(...path)));
    return this.hasPrivateKey();
  }

  /**
   * stores privateKey
   * @param path
   */
  public async storePrivateKey(...path: string[]): Promise<void> {
    if (!this.storage) {
      throw new Error("Undefined storage");
    }

    await Promise.resolve(this.storage.set(this.privateKey, ...path));
  }

  /**
   * generates privateKey
   */
  public generatePrivateKey(): void {
    this.setPrivateKey(generatePrivateKey());
  }

  /**
   * sets privateKey
   * @param privateKey
   */
  public setPrivateKey(privateKey: Buffer): void {
    if (privateKey) {
      this.privateKey = privateKey;
      this.address = privateKeyToAddress(privateKey);
    }
  }

  /**
   * checks if has privateKey
   */
  public hasPrivateKey(): boolean {
    return !!this.privateKey;
  }
}