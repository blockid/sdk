import { IApi } from "../api";
import { IDevice } from "../device";
import { IEnsNode } from "../ens";
import { AbstractAttributesHolder } from "../shared";
import { IdentityStates } from "./constants";
import { IIdentity, IIdentityAttributes } from "./interfaces";

/**
 * Identity
 */
export class Identity extends AbstractAttributesHolder<IIdentityAttributes> implements IIdentity {

  /**
   * creates
   * @param api
   * @param device
   */
  public static create(api: IApi, device: IDevice): IIdentity {
    return new Identity(api, device);
  }

  /**
   * constructor
   * @param api
   * @param device
   */
  private constructor(private api: IApi, private device: IDevice) {
    super({
      address: true,
      state: true,
      ensNode: true,
    });
  }

  /**
   * verifies ens node
   * @param ensNode
   */
  public async verifyEnsNode(ensNode: IEnsNode): Promise<boolean> {
    let result = false;

    try {
      const { nameHash } = ensNode;
      const { address } = await this.api.getIdentity(nameHash);

      if (address) {
        const { purpose } = await this.api.getMember(address, this.device.address);

        result = !!purpose;

        if (result) {
          this.attributes = {
            address,
            state: IdentityStates.Verified,
            ensNode,
          };
        }
      }

    } catch (err) {
      result = false;
    }

    return result;
  }
}
