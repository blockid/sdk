import { Subject } from "rxjs";
import { TUniqueBehaviorSubject } from "../shared";
import { IWsMessage } from "../ws";
import { ApiStates } from "./constants";
import { ApiResponses } from "./namespaces";

export interface IApi {
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  state$: TUniqueBehaviorSubject<ApiStates>;
  state: ApiStates;
  wsMessage$: Subject<IWsMessage>;
  verifySession(signature: Buffer): void;
  muteSession(): void;
  unMuteSession(): void;
  verifyPersonalMessage(recipient: string, signature: Buffer): void;
  getSettings(): Promise<ApiResponses.ISettings>;
  getIdentity(identity: string): Promise<ApiResponses.IIdentity>;
  getIdentityMembers(identity: string): Promise<ApiResponses.IIdentityMember[]>;
  getIdentityMember(identity: string, member: string): Promise<ApiResponses.IIdentityMember>;
  callIdentityMethod(identity: string, method: string, body: any): Promise<ApiResponses.IIdentityMethodCall>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  reconnectTimeout?: number;
}

export interface IApiConnection {
  connected$: TUniqueBehaviorSubject<boolean>;
  error$: Subject<any>;
  data$: Subject<Buffer>;
  connect(endpoint: string): void;
  disconnect(emit?: boolean): void;
  send(data: Buffer): void;
}

export interface IApiRequest {
  method?: string;
  path: string;
  body?: { [ key: string ]: any };
}
