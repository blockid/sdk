import { IBN } from "bn.js";
import * as EthereumTx from "ethereumjs-tx";
import { AttributesProxySubject, TAttributesSchema } from "rxjs-addons";
import {
  verifyPrivateKey,
  verifyPublicKey,
  privateToPublicKey,
  signPersonalMessage,
  publicKeyToAddress,
  prepareAddress,
  anyToHex,
} from "eth-utils";
import { INetwork, INetworkTransactionOptions } from "../network";
import { IDevice, IDeviceAttributes } from "./interfaces";
import { errDeviceUnknownAddress } from "./errors";

const attributesSchema: TAttributesSchema<IDeviceAttributes> = {
  address: {
    getter: true,
    subject: true,
  },
};

/**
 * Device
 */
export class Device extends AttributesProxySubject<IDeviceAttributes> implements IDevice {

  /**
   * prepares attributes
   * @param attributes
   */
  public static prepareAttributes(attributes: IDeviceAttributes = null): IDeviceAttributes {
    let result: IDeviceAttributes = {
      address: null,
      publicKey: null,
      privateKey: null,
    };

    if (attributes) {
      let { privateKey, publicKey, address } = attributes;

      if (
        privateKey &&
        verifyPrivateKey(privateKey)
      ) {
        publicKey = privateToPublicKey(privateKey);
      } else {
        privateKey = null;
      }

      if (
        publicKey &&
        verifyPublicKey(publicKey)
      ) {
        address = publicKeyToAddress(publicKey);
      } else {
        publicKey = null;
      }

      if (address) {
        address = prepareAddress(address);
      }

      result = {
        address,
        publicKey,
        privateKey,
      };
    }

    return result;
  }

  /**
   * constructor
   * @param network
   */
  constructor(private network: INetwork) {
    super(null, {
      schema: attributesSchema,
      prepare: Device.prepareAttributes,
    });
  }

  /**
   * gets balance
   */
  public getBalance(): Promise<IBN> {
    this.verifyAddress();

    return this.network.getBalance(this);
  }

  /**
   * gets transaction count
   */
  public getTransactionCount(): Promise<IBN> {
    this.verifyAddress();

    return this.network.getTransactionCount(this);
  }

  /**
   * signs personal message
   * @param message
   */
  public async signPersonalMessage(message: Buffer | string): Promise<Buffer> {
    this.verifyAddress();

    let result: Buffer;

    const { address, privateKey } = this.attributes;

    if (privateKey) {
      result = signPersonalMessage(message, privateKey);
    } else {
      result = await this.network.signPersonalMessage(message, address);
    }

    return result;
  }

  /**
   * sends transaction
   * @param options
   */
  public async sendTransaction(options: INetworkTransactionOptions): Promise<string> {
    this.verifyAddress();

    let result: string = null;

    const nonce = await this.getTransactionCount();

    const { address, privateKey } = this.attributes;

    if (privateKey) {
      const { data, gasPrice, gas, value, to, nonce } = options;

      const hexOptions = {
        add0x: true,
        evenLength: true,
      };

      const params = {
        to,
        nonce: anyToHex(nonce, hexOptions),
        gasPrice: anyToHex(gasPrice, hexOptions),
        gasLimit: anyToHex(gas, hexOptions),
        value: anyToHex(value, hexOptions),
        data: anyToHex(data, hexOptions),
      };

      const ethereumTx = new EthereumTx(params);

      ethereumTx.sign(privateKey);

      const raw = ethereumTx.serialize();

      result = await this.network.sendRawTransaction(raw);

    } else {
      result = await this.network.sendTransaction({
        ...options,
        nonce,
        from: address,
      });
    }

    return result;
  }

  private verifyAddress(): void {
    if (!this.getAttribute("address")) {
      throw errDeviceUnknownAddress;
    }
  }
}
