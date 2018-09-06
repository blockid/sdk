import * as BN from "bn.js";
import { IApi } from "../api";
import { IDevice } from "../device";
import { IEnsNode } from "../ens";
import { INetwork } from "../network";
import { AbstractAttributesHolder, UniqueBehaviorSubject, buildPersonalMessage } from "../shared";
import { IdentityInteractionModes, IdentityStates } from "./constants";
import { IdentityContract, IIdentityContract } from "./contracts";
import { errIdentityInvalidState } from "./errors";
import { IIdentity, IIdentityAttributes, IIdentityMember } from "./interfaces";

/**
 * Identity
 */
export class Identity extends AbstractAttributesHolder<IIdentityAttributes> implements IIdentity {

  /**
   * balance subject
   */
  public balance$ = new UniqueBehaviorSubject<BN.IBN>(null);

  /**
   * members subject
   */
  public members$ = new UniqueBehaviorSubject<IIdentityMember[]>(null);

  private contract: IIdentityContract;

  /**
   * constructor
   * @param api
   * @param network
   * @param device
   * @param interactionModes
   */
  constructor(
    private api: IApi,
    private network: INetwork,
    private device: IDevice,
    private interactionModes = IdentityInteractionModes.GasRelated,
  ) {
    super({
      address: true,
      state: true,
      ensNode: true,
    });

    this.contract = new IdentityContract(network, device);

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
   * fetches members
   */
  public async fetchMembers(): Promise<void> {
    let members: IIdentityMember[] = [];

    try {
      members = await this.api.getIdentityMembers(this.getAttribute("address"));
    } catch (err) {
      members = [];
    }

    this.members$.next(members);
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
      if (value) {
        this.members$.next(
          value.filter(({ address }) => address !== member.address),
        );
      }
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

    const identityAddress = this.getAttribute<string>("address");

    if (!purpose) {
      purpose = identityAddress;
    }

    let unlimited = false;

    if (!limit) {
      unlimited = true;
      limit = new BN(0);
    }

    switch (this.interactionModes) {
      case IdentityInteractionModes.GasRelated: {
        const methodName = "gasRelayedAddMember";
        const methodSignature = this.contract.getMethodSignature(methodName);

        const args = [
          nonce,
          address,
          purpose,
          limit,
          unlimited,
        ];

        const extraGas = this.contract.estimateExtraGas(
          methodName,
          ...args,
        );

        const gasPrice = await this.network.getGasPrice();

        const message = buildPersonalMessage(
          "address", // identity address
          "bytes",   // method signature
          "uint256", // nonce
          "address", // member
          "address", // purpose
          "uint256", // limit
          "bool",    // unlimited
          "uint256", // extra gas
          "uint256", // gas price
        )(
          identityAddress,
          methodSignature,
          ...args,
          extraGas,
          gasPrice,
        );

        const messageSignature = await this.device.signPersonalMessage(message);

        const res = await this.api.callIdentityMethod(identityAddress, methodName, {
          args,
          gasPrice,
          extraGas,
          messageSignature,
        });

        hash = res.hash;
        break;
      }

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

  /**
   * sends remove member
   * @param address
   */
  public async sendRemoveMember({ address }: Partial<IIdentityMember>): Promise<boolean> {
    this.verifyState(IdentityStates.Verified);

    let hash: string = null;

    const nonce = await this.contract.nonce;

    const identityAddress = this.getAttribute<string>("address");

    switch (this.interactionModes) {
      case IdentityInteractionModes.GasRelated: {
        const methodName = "gasRelayedRemoveMember";
        const methodSignature = this.contract.getMethodSignature(methodName);

        const args = [
          nonce,
          address,
        ];

        const extraGas = this.contract.estimateExtraGas(
          methodName,
          ...args,
        );

        const gasPrice = await this.network.getGasPrice();

        const message = buildPersonalMessage(
          "address", // identity address
          "bytes",   // method signature
          "uint256", // nonce
          "address", // member
          "uint256", // extra gas
          "uint256", // gas price
        )(
          identityAddress,
          methodSignature,
          ...args,
          extraGas,
          gasPrice,
        );

        const messageSignature = await this.device.signPersonalMessage(message);

        const res = await this.api.callIdentityMethod(identityAddress, methodName, {
          args,
          gasPrice,
          extraGas,
          messageSignature,
        });

        hash = res.hash;
        break;
      }

      case IdentityInteractionModes.Direct:
        hash = await this.contract.removeMember(
          nonce,
          address,
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
