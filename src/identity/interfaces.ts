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
  ensNode$?: TUniqueBehaviorSubject<Partial<IEnsNode>>;
  ensNode?: Partial<IEnsNode>;
  balance$?: TUniqueBehaviorSubject<IBN>;
  balance?: IBN;
  nonce$?: TUniqueBehaviorSubject<IBN>;
  nonce?: IBN;
  createdAt$?: TUniqueBehaviorSubject<number>;
  createdAt?: number;
  updatedAt$?: TUniqueBehaviorSubject<number>;
  updatedAt?: number;
  setStateAsCreating(attributes: Partial<IIdentityAttributes>): void;
  setStateAsPending(attributes: Partial<IIdentityAttributes>): void;
  update(attributes: Partial<IIdentityAttributes>): void;
  addMember(member: Partial<IIdentityMember>): Promise<boolean>;
}

export interface IIdentityAttributes {
  address?: string;
  state: IdentityStates;
  ensNode: Partial<IEnsNode>;
  balance?: IBN;
  nonce?: IBN;
  createdAt?: number;
  updatedAt?: number;
}

export interface IIdentityMember {
  address: string;
  purpose: string;
  limit: IBN;
  unlimited: boolean;
  manager: string;
}
