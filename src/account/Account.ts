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
      updatedAt: null,
    };

    if (attributes) {
      result = {
        ...result,
        ...(oldAttributes || {}),
        ...attributes,
      };

      if (
        oldAttributes &&
        oldAttributes.updatedAt &&
        result.updatedAt &&
        oldAttributes.updatedAt.getTime() > result.updatedAt.getTime()) {
        result = oldAttributes;
      }
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
    this.updateAttributes({
      ...attributes,
      updatedAt: new Date(),
    });
  }
}
