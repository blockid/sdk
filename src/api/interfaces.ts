import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAbstractOptionsHolder } from "../shared";
import { IWsMessage } from "../ws";
import { ApiStatus } from "./constants";
import { ApiResponses } from "./namespaces";

export interface IApi extends IAbstractOptionsHolder<IApiOptions> {
  status$: TUniqueBehaviorSubject<ApiStatus>;
  status: ApiStatus;
  wsMessage$: Subject<IWsMessage>;
  connect(): void;
  verifySession(): Promise<void>;
  getSettings(): Promise<ApiResponses.ISettings>;
  getIdentity(identity: string): Promise<ApiResponses.IIdentity>;
  getMembers(identity: string): Promise<ApiResponses.IMember[]>;
  getMember(identity: string, member: string): Promise<ApiResponses.IMember>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
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
