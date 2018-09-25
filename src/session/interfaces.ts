import { TUniqueBehaviorSubject, IErrorSubject } from "rxjs-addons";

export interface ISession {
  error$: IErrorSubject;
  verified$: TUniqueBehaviorSubject<boolean>;
  readonly verified: boolean;
}

export interface ISessionOptions {
  autoVerify?: boolean;
}
