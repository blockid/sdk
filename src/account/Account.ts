import { AttributesProxySubject, TAttributesSchema } from "rxjs-addons";
import { SharedAccountContact, ISharedAccountContact } from "../contract";
import { IApi } from "../api";
import { IDevice } from "../device";
import { INetwork } from "../network";
import { IAccount, IAccountOptions, IAccountAttributes } from "./interfaces";

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

  private localAttributesCache: IAccountAttributes = null;

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
}
