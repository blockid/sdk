import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAttributesProxySubject, IErrorSubject } from "rxjs-addons";
import { IApiEvent } from "./events";
import { ApiConnectionStates } from "./constants";

export interface IApi {
  connection: IApiConnection;
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  error$: IErrorSubject;
  auth(): Promise<void>;
  disconnect(): void;
  muteConnection(): void;
  unMuteConnection(): void;
  getSettings<B = any>(): Promise<B>;
}

export interface IApiConnection extends IAttributesProxySubject<IApiConnectionAttributes> {
  state$?: TUniqueBehaviorSubject<ApiConnectionStates>;
  state?: ApiConnectionStates;
  muted$?: TUniqueBehaviorSubject<boolean>;
  muted?: boolean;
  event$: Subject<IApiEvent>;
  error$: IErrorSubject;
  connect(endpoint: string, protocol: string): void;
  disconnect(emitState?: boolean): void;
  emit<T = any>(event: IApiEvent<T>): void;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  reconnectTimeout?: number;
  manualAuth?: boolean;
}

export interface IApiConnectionAttributes {
  state: ApiConnectionStates;
  muted: boolean;
}

export interface IApiRequest<B = any> {
  method: string;
  path: string;
  body?: B;
}

export interface IApiResponse<D = any> {
  data?: D;
  error?: string;
  errors?: { [ key: string ]: string };
}
