import { BehaviorSubject } from "rxjs";
import { IdentityStatus } from "./constants";

export interface IIdentityState {
  address: string;
  ens: string;
}

export interface IIdentity {
  status$: BehaviorSubject<IdentityStatus>;
  state$: BehaviorSubject<IIdentityState>;
  status: IdentityStatus;
  state: IIdentityState;
  restoreState(): Promise<boolean>;
  storeState(): Promise<void>;
}
