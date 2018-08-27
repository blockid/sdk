import { IEnsNode } from "../ens";
import { IAbstractAddressHolder } from "../shared/abstract";
import { TUniqueBehaviorSubject } from "../shared/rx";
import { IdentityStates } from "./constants";

export interface IIdentity extends IAbstractAddressHolder {
  state$: TUniqueBehaviorSubject<IdentityStates>;
  state: IdentityStates;
  ensNode$: TUniqueBehaviorSubject<IEnsNode>;
  ensNode: IEnsNode;
  verifyEnsNode(ensNode: IEnsNode): Promise<boolean>;
}
