import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAttributesProxySubject } from "rxjs-addons";
import { IApiEvent } from "./events";
import { ApiStates } from "./constants";

export interface IApi extends IAttributesProxySubject<IApiAttributes> {
  state$?: TUniqueBehaviorSubject<ApiStates>;
  state?: ApiStates;
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  event$: Subject<IApiEvent>;
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
