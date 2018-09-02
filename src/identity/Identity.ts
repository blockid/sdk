import { IApi } from "../api";
import { IDevice } from "../device";
import { INetwork } from "../network";
import { IEnsNode } from "../ens";
import { AbstractAttributesHolder } from "../shared";
import { IdentityStates } from "./constants";
import { errIdentityInvalidState } from "./errors";
import { IIdentity, IIdentityAttributes, IIdentityMember } from "./interfaces";
import { IIdentityContact, IdentityContact } from "./contracts";

/**
 * Identity
 */
export class Identity extends AbstractAttributesHolder<IIdentityAttributes> implements IIdentity {

  private contract: IIdentityContact;

  /**
   * constructor
   * @param api
   * @param network
   * @param device
   */
  constructor(private api: IApi, network: INetwork, private device: IDevice) {
    super({
      address: true,
      state: true,
      ensNode: true,
      nonce: true,
      balance: true,
      createdAt: true,
      updatedAt: true,
    });

    this.contract = new IdentityContact(network, device);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * sets state as creating
   * @param attributes
   */
  public setStateAsCreating({ ensNode }: Partial<IIdentityAttributes>): void {
    this.attributes = {
      address: null,
      ensNode,
      state: IdentityStates.Creating,
    };
  }

  /**
   * sets state as pending
   * @param attributes
   */
  public setStateAsPending({ address, ensNode }: Partial<IIdentityAttributes>): void {
    this.attributes = {
      address,
      ensNode,
      state: IdentityStates.Pending,
    };
  }

  /**
   * updates
   * @param address
   * @param attributes
   */
  public update({ ensNode, ...attributes }: Partial<IIdentityAttributes>): void {
    const { address } = attributes;
    if ((
      address &&
      address && this.getAttribute("address")
    ) || (
      ensNode &&
      this.getAttribute("ensNode") &&
      ensNode.nameHash === (this.getAttribute("ensNode") as Partial<IEnsNode>).nameHash
    )) {
      this.updateAttributes(attributes);
    }
  }

  /**
   * adds member
   * @param address
   * @param purpose
   * @param limit
   * @param unlimited
   */
  public async addMember({ address, purpose, limit, unlimited }: Partial<IIdentityMember>): Promise<boolean> {
    this.verifyState(IdentityStates.Verified);

    let hash: string = null;
    if (this.device.hasPrivateKey) {
      hash = await this.contract.addMember(address, purpose, limit, unlimited);
    } else {
      // TODO: gas related
    }

    return !!hash;
  }

  private verifyState(requireState: IdentityStates): void {
    if (requireState !== this.getAttribute("state")) {
      throw errIdentityInvalidState;
    }
  }
}
