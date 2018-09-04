import * as BN from "bn.js";
import { IApi } from "../api";
import { IDevice } from "../device";
import { IEnsNode } from "../ens";
import { INetwork } from "../network";
import { AbstractAttributesHolder, UniqueBehaviorSubject } from "../shared";
import { IdentityInteractionModes, IdentityStates } from "./constants";
import { IdentityContact, IIdentityContact } from "./contracts";
import { errIdentityInvalidState } from "./errors";
import { IIdentity, IIdentityAttributes, IIdentityMember } from "./interfaces";

/**
 * Identity
 */
export class Identity extends AbstractAttributesHolder<IIdentityAttributes> implements IIdentity {

  /**
   * members subject
   */
  public members$ = new UniqueBehaviorSubject<IIdentityMember[]>(null);

  private contract: IIdentityContact;

  /**
   * constructor
   * @param api
   * @param network
   * @param device
   * @param interactionModes
   */
  constructor(
    private api: IApi, network: INetwork,
    private device: IDevice,
    private interactionModes = IdentityInteractionModes.GasRelated,
  ) {
    super({
      address: true,
      state: true,
      ensNode: true,
    });

    this.contract = new IdentityContact(network, device);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }

  /**
   * balance getter
   */
  public get balance(): Promise<BN.IBN> {
    return this.contract.balance;
  }

  /**
   * sets state as creating
   * @param ensNode
   */
  public setStateAsCreating(ensNode: IEnsNode): void {
    this.attributes = {
      address: null,
      ensNode,
      state: IdentityStates.Creating,
    };
  }

  /**
   * sets state as pending
   * @param address
   * @param ensNode
   */
  public setStateAsPending(address: string, ensNode: IEnsNode): void {
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
      this.getAttribute("ensNode") &&
      ensNode &&
      ensNode.nameHash === this.getAttribute<IEnsNode>("ensNode").nameHash
    )) {
      this.updateAttributes(attributes);
    }
  }

  /**
   * adds member
   * @param member
   */
  public addMember(member: IIdentityMember): void {
    if (member) {
      const { value } = this.members$;
      if (value) {
        this.members$.next([
          ...value,
          member as any,
        ]);
      }
    }
  }

  /**
   * updates member
   * @param member
   */
  public updateMember(member: Partial<IIdentityMember>): void {
    if (member) {
      const { value } = this.members$;
      // TODO
    }
  }

  /**
   * removes member
   * @param member
   */
  public removeMember(member: Partial<IIdentityMember>): void {
    if (member) {
      const { value } = this.members$;
      // TODO
    }
  }

  /**
   * sends add member
   * @param address
   * @param purpose
   * @param limit
   */
  public async sendAddMember({ address, purpose, limit }: Partial<IIdentityMember>): Promise<boolean> {
    this.verifyState(IdentityStates.Verified);

    let hash: string = null;

    const nonce = await this.contract.nonce;

    if (!purpose) {
      purpose = this.getAttribute("address") as string;
    }

    let unlimited = false;

    if (!limit) {
      unlimited = true;
      limit = new BN(0);
    }

    switch (this.interactionModes) {
      case IdentityInteractionModes.GasRelated:
        break;

      case IdentityInteractionModes.Direct:
        hash = await this.contract.addMember(
          nonce,
          address,
          purpose,
          limit,
          unlimited,
        );
        break;
    }

    return !!hash;
  }

  private verifyState(requireState: IdentityStates): void {
    if (requireState !== this.getAttribute("state")) {
      throw errIdentityInvalidState;
    }
  }
}
