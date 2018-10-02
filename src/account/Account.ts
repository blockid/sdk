import * as BN from "bn.js";
import { AttributesProxySubject, TAttributesSchema } from "rxjs-addons";
import { IApi } from "../api";
import { ISharedAccountContact, SharedAccountContact } from "../contract";
import { IDevice } from "../device";
import { INetwork } from "../network";
import {
  IAccount,
  IAccountAttributes,
  IAccountOptions,
  IAccountDeviceAttributes,
} from "./interfaces";

const attributesSchema: TAttributesSchema<IAccountAttributes> = {
  salt: {
    getter: true,
  },
  ensName: {
    getter: true,
  },
};

/**
 * Account
 */
export class Account extends AttributesProxySubject<IAccountAttributes> implements IAccount {

  /**
   * prepares attributes
   * @param attributes
   * @param oldAttributes
   */
  public static prepareAttributes(attributes: IAccountAttributes = null, oldAttributes: IAccountAttributes = null): IAccountAttributes {
    let result: IAccountAttributes = {
      salt: null,
      state: null,
      ensName: null,
      address: null,
      balance: null,
      updatedAt: null,
    };

    if (attributes) {
      result = {
        ...result,
        ...(oldAttributes || {}),
        ...attributes,
      };
    }

    return result;
  }

  private options: IAccountOptions;

  private contract: ISharedAccountContact;

  private localAttributesCache: IAccountAttributes = null;

  /**
   * constructor
   * @param api
   * @param device
   * @param network
   * @param options
   */
  constructor(private api: IApi, private device: IDevice, private network: INetwork, options: IAccountOptions = null) {
    super(null, {
      schema: attributesSchema,
      prepare: Account.prepareAttributes,
    });

    this.options = {
      useGasRelay: true,
      ...(options || {}),
    };

    this.contract = new SharedAccountContact(device, network);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * ready getter
   */
  public get ready(): boolean {
    return !!this.getAttribute("salt");
  }

  /**
   * updates local attributes
   * @param attributes
   */
  public updateLocalAttributes(attributes: Partial<IAccountAttributes>): void {
    this.localAttributesCache = this.attributes;

    this.updateAttributes({
      ...attributes,
    });

  }

  /**
   * reverts local attributes
   */
  public revertLocalAttributes(): void {
    this.attributes = this.localAttributesCache;
    this.localAttributesCache = null;
  }

  /**
   * deploys device
   * @param accountDevice
   */
  public async deployDevice(accountDevice: IAccountDeviceAttributes): Promise<void> {
    const nonce = await this.contract.nonce;
    const gasPrice = await this.network.getGasPrice();

    const member = accountDevice.device.address;
    const purpose = accountDevice.app ? accountDevice.app.address : this.contract.address;
    const limit = accountDevice.limit || new BN(0);
    const unlimited = !accountDevice.limit;

    const refundGasBase = this.contract.estimateAddMemberRefundGasBase(
      nonce,
      member,
      purpose,
      limit,
      unlimited,
    );

    const signature = await this.contract.calcAddMemberSignature(
      nonce,
      member,
      purpose,
      limit,
      unlimited,
      refundGasBase,
      gasPrice,
    );

    await this.api.deployAccountDevice(this.attributes, accountDevice.device, nonce, signature, gasPrice);
  }
}
