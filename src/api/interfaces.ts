import { BehaviorSubject, Subject } from "rxjs";
import { IWsMessage } from "blockid-core";
import { ApiStatus } from "./constants";
import { TApiConnectionFactory } from "./types";
import { ApiResponses } from "./namespaces";

export interface IApi {
  status$: BehaviorSubject<ApiStatus>;
  error$: Subject<any>;
  message$: Subject<IWsMessage>;
  status: ApiStatus;
  setOptions(options: IApiOptions): void;
  reconnect(): void;
  disconnect(): void;
  getSettings(): Promise<ApiResponses.IGetSettings>;
  verifySession(): void;
}

export interface IApiConnection {
  connected$: Subject<boolean>;
  error$: Subject<any>;
  data$: Subject<Buffer>;
  connect(): void;
  disconnect(): void;
  send(data: Buffer): void;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  mock?: (req: IApiRequest) => Promise<any>;
  connectionFactory?: TApiConnectionFactory;
}

export interface IApiRequest {
  method?: string;
  path: string;
  options?: {
    headers?: { [ key: string ]: any };
    body?: { [ key: string ]: any };
  };
}
