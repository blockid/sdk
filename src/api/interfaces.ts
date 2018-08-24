import { Subject } from "rxjs";
import { TUniqueBehaviorSubject } from "../shared/rx";
import { IWsMessage } from "../ws";
import { ApiStatus } from "./constants";

export interface IApi {
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  status$: TUniqueBehaviorSubject<ApiStatus>;
  status: ApiStatus;
  wsMessage$: Subject<IWsMessage>;
  connect(): void;
  verifySession(): Promise<void>;
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
