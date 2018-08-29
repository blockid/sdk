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
  verifyEnsNode(ensNode: IEnsNode): Promise<boolean>;
}

export interface IIdentityAttributes {
  address?: string;
  state: IdentityStates;
  ensNode: IEnsNode;
}
