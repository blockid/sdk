import { TUniqueBehaviorSubject, IErrorSubject } from "rxjs-addons";

export interface ISession {
  error$: IErrorSubject;
  verified$: TUniqueBehaviorSubject<boolean>;
  muted$: TUniqueBehaviorSubject<boolean>;
  readonly verified: boolean;
  readonly muted: boolean;
  verify(): Promise<void>;
  mute(): void;
  unMute(): void;
}

export interface ISessionOptions {
  autoVerify?: boolean;
}
