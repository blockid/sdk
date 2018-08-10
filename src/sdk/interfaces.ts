import { Subject } from "rxjs";
import { IApi, IApiOptions } from "../api";
import { IMember, IMemberOptions } from "../member";
import { INetwork } from "../network";

export interface ISdk {
  error$: Subject<any>;
  api: IApi;
  member: IMember;
  network: INetwork;
}

export interface ISdkOptions {
  api: IApiOptions;
  member?: IMemberOptions;
}
