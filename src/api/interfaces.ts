import { BehaviorSubject } from "rxjs";
import { NetworkVersions } from "../network";
import { ApiStatus } from "./constants";

export interface IApi {
  status$: BehaviorSubject<ApiStatus>;
  setStatus(status: ApiStatus): void;
  getStatus(): ApiStatus;
  setOptions(options: IApiOptions): void;
  getSettings(): Promise<IApiResponseSettings>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  mock?: (req: IApiRequest) => Promise<any>;
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
