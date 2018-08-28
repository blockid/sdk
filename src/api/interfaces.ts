import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAbstractOptionsHolder } from "../shared";
import { IWsMessage } from "../ws";
import { ApiStates } from "./constants";
import { ApiResponses } from "./namespaces";

export interface IApi extends IAbstractOptionsHolder<IApiOptions> {
  state$: TUniqueBehaviorSubject<ApiStates>;
  state: ApiStates;
  wsMessage$: Subject<IWsMessage>;
  verifySession(): Promise<void>;
  getSettings(): Promise<ApiResponses.ISettings>;
  getIdentity(identityAddressOrEnsNameHash: string): Promise<ApiResponses.IIdentity>;
  getMembers(identityAddress: string): Promise<ApiResponses.IMember[]>;
  getMember(identityAddress: string, memberAddress: string): Promise<ApiResponses.IMember>;
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
  options?: {
    headers?: { [ key: string ]: any };
    body?: { [ key: string ]: any };
  };
}
