import { IBN } from "bn.js";
import { IEnsNode } from "../ens";
import { IAbstractAttributesHolder } from "../shared/abstract";
import { TUniqueBehaviorSubject } from "../shared/rx";
import { IdentityStates } from "./constants";

export interface IIdentity extends IAbstractAttributesHolder<IIdentityAttributes> {
  address$?: TUniqueBehaviorSubject<string>;
  address?: string;
  state$?: TUniqueBehaviorSubject<IdentityStates>;
  state?: IdentityStates;
  ensNode$?: TUniqueBehaviorSubject<IEnsNode>;
  ensNode?: IEnsNode;
  members$: TUniqueBehaviorSubject<IIdentityMember[]>;
  balance$?: TUniqueBehaviorSubject<IBN>;
  balance: Promise<IBN>;
  setStateAsCreating(ensNode: IEnsNode): void;
  setStateAsPending(address: string, ensNode: IEnsNode): void;
  update(attributes: Partial<IIdentityAttributes>): void;
  fetchMembers(): Promise<void>;
  addMember(member: IIdentityMember): void;
  removeMember(member: Partial<IIdentityMember>): void;
  updateMember(member: Partial<IIdentityMember>): void;
  sendAddMember(member: Partial<IIdentityMember>): Promise<boolean>;
  sendRemoveMember(member: Partial<IIdentityMember>): Promise<boolean>;
}

export interface IIdentityAttributes {
  address?: string;
  state: IdentityStates;
  ensNode: IEnsNode;
}

export interface IIdentityMember {
  address: string;
  purpose: string;
  limit: IBN;
  updatedAt?: number;
}
