import { BehaviorSubject, Subject } from "rxjs";
import { NetworkVersions } from "../network";
import { ApiStatus, ApiMessageTypes } from "./constants";
import { TApiConnectionFactory } from "./types";

export interface IApi {
  status$: BehaviorSubject<ApiStatus>;
  error$: Subject<any>;
  message$: Subject<IApiMessage>;
  setStatus(status: ApiStatus): void;
  getStatus(): ApiStatus;
  setOptions(options: IApiOptions): void;
  reconnect(): void;
  disconnect(): void;
  getSettings(): Promise<IApiResponseSettings>;
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

export interface IApiMessage<T = any> {
  type: ApiMessageTypes;
  payload?: T;
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

export interface IApiResponseSettings {
  ens: {
    serviceAddress: string;
    resolverAddress: string;
    supportedDomains: string[];
  };
  identity: {
    registryAddress: string;
  };
  network: {
    version: NetworkVersions;
    providerEndpoint: string;
  };
}
