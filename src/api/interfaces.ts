import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAttributesProxySubject } from "rxjs-addons";
import { ApiEvents, IApiEvent } from "./events";
import { ApiStates } from "./constants";

export interface IApi extends IAttributesProxySubject<IApiAttributes> {
  state$?: TUniqueBehaviorSubject<ApiStates>;
  state?: ApiStates;
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  event$: Subject<IApiEvent>;
  sendVerifySession(payload: ApiEvents.Payloads.ISignedSession): void;
  sendMuteSession(): void;
  sendUnMuteSession(): void;
  callGetSettings<T = any>(): Promise<T>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  reconnectTimeout?: number;
}

export interface IApiAttributes {
  state: ApiStates;
}
