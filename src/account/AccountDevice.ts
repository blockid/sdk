import { AttributesProxySubject, TAttributesSchema } from "rxjs-addons";
import { IAccountDevice, IAccountDeviceAttributes } from "./interfaces";

const attributesSchema: TAttributesSchema<IAccountDeviceAttributes> = {
  limit: {
    getter: true,
  },
};

/**
 * Account device
 */
export class AccountDevice extends AttributesProxySubject<IAccountDeviceAttributes> implements IAccountDevice {

  /**
   * prepares attributes
   * @param attributes
   */
  public static prepareAttributes(attributes: IAccountDeviceAttributes = null): IAccountDeviceAttributes {
    let result: IAccountDeviceAttributes = {
      app: null,
      device: null,
      limit: null,
      state: null,
      updatedAt: null,
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
   */
  constructor() {
    super(null, {
      schema: attributesSchema,
      prepare: AccountDevice.prepareAttributes,
    });
  }
}
