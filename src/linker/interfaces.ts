import { TUniqueBehaviorSubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { LinkerActionsTypes, LinkerActionSenderTypes } from "./constants";

export interface ILinker {
  incomingUrl$: TUniqueBehaviorSubject<string>;
  incomingAction$: TUniqueBehaviorSubject<ILinkerAction>;
  acceptedAction$: TUniqueBehaviorSubject<ILinkerAction>;
  app: IAppAttributes;
  acceptAction(action?: ILinkerAction): void;
  rejectAction(): void;
  buildActionUrl<P = any, S = any>(action: ILinkerAction<P, S>, options?: ILinkerBuildActionUrlOptions): string;
  buildActionUrls<P = any>(action: ILinkerAction<P, any>, toApp?: IAppAttributes): ILinkerActionUrls;
}

export interface ILinkerOptions {
  app?: IAppAttributes;
  autoAcceptActions?: boolean;
}

export interface ILinkerBuildActionUrlOptions {
  toApp?: IAppAttributes;
  senderType?: LinkerActionSenderTypes;
}

export interface ILinkerActionSender<T = any> {
  type: LinkerActionSenderTypes;
  data: T;
}

export interface ILinkerAction<P = any, S = any> {
  type: LinkerActionsTypes;
  sender?: ILinkerActionSender<S>;
  payload: P;
}

export interface ILinkerActionUrls {
  appUrl: string;
  deviceUrl: string;
}
