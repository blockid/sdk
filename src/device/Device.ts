import { IBN } from "bn.js";
import { AbstractAddressHolder } from "../shared";
import { INetwork, INetworkTransactionOptions } from "../network";
import { KeyPair } from "../keyPair";
import { IDevice, IDeviceOptions } from "./interfaces";

/**
 * Device
 */
export class Device extends AbstractAddressHolder implements IDevice {

  private keyPair = new KeyPair();

  /**
   * constructor
   * @param network
   * @param options
   */
  constructor(private network: INetwork, options: IDeviceOptions = {}) {
    super();
    const { privateKey } = options;

    this.keyPair
      .address$
      .subscribe(this.address$);

    this.setPrivateKey(privateKey);
  }

  /**
   * sets private key
   * @param privateKey
   */
  public setPrivateKey(privateKey: Buffer = null): void {
    this.address = null;
    this.keyPair.update({
      privateKey,
    });
  }

  /**
   * signs personal message
   * @param message
   */
  public async signPersonalMessage(message: Buffer | string): Promise<Buffer> {
    this.verifyAddress();

    let result: Buffer;

    if (
      this.keyPair.canSign &&
      this.address === this.keyPair.address
    ) {
      result = this.keyPair.signPersonalMessage(message);
    } else {
      result = await this.network.signPersonalMessage(message, this.address);
    }

    return result;
  }

  /**
   * gets balance
   */
  public getBalance(): Promise<IBN> {
    return this.network.getBalance(this);
  }

  /**
   * gets transaction count
   */
  public getTransactionCount(): Promise<IBN> {
    return this.network.getTransactionCount(this);
  }

  /**
   * sends transaction
   * @param options
   */
  public async sendTransaction(options: INetworkTransactionOptions): Promise<string> {
    this.verifyAddress();

    let result: string = null;

    const nonce = await this.getTransactionCount();

    if (
      this.keyPair.canSign &&
      this.address === this.keyPair.address
    ) {
      // TODO: sign and send raw transaction
    } else {
      result = await this.network.sendTransaction({
        ...options,
        nonce,
        from: this.address,
      });
    }

    return result;
  }
}
