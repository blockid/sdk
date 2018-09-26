import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAttributesProxySubject, IErrorSubject } from "rxjs-addons";
import { IApiEvent } from "./events";
import { ApiConnectionStates, ApiSessionStates } from "./constants";

export interface IApi {
  connection: IApiConnection;
  session: IApiSession;
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  event$: Subject<IApiEvent>;
  error$: IErrorSubject;
  createSession(): Promise<void>;
  destroySession(): void;
  muteConnection(): void;
  unMuteConnection(): void;
  getSettings<B = any>(): Promise<B>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  reconnectTimeout?: number;
  manualAuth?: boolean;
}

export interface IApiConnection extends IAttributesProxySubject<IApiConnectionAttributes> {
  state$?: TUniqueBehaviorSubject<ApiConnectionStates>;
  state?: ApiConnectionStates;
  muted$?: TUniqueBehaviorSubject<boolean>;
  muted?: boolean;
  data$: Subject<Buffer>;
  error$: IErrorSubject;
  opened: boolean;
  open(endpoint: string, protocol: string): void;
  close(emitState?: boolean): void;
  send(data: Buffer): void;
}

export interface IApiSession extends IAttributesProxySubject<IApiSessionAttributes> {
  token?: string;
  state$?: TUniqueBehaviorSubject<ApiSessionStates>;
  state?: ApiSessionStates;
  verified: boolean;
  signHash(hash: Buffer): Promise<{
    signer: string;
    signature: Buffer;
  }>;
  setAsVerifying(token?: string): void;
  setAsVerified(token: string): void;
  setAsDestroyed(): void;
}

export interface IApiSessionAttributes {
  token: string;
  state: ApiSessionStates;
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
