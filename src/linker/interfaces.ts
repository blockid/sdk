import { TUniqueBehaviorSubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { LinkerActionsTypes, LinkerActionSenderTypes } from "./constants";

export interface ILinker {
  incomingUrl$: TUniqueBehaviorSubject<string>;
  incomingAction$: TUniqueBehaviorSubject<ILinkerAction>;
  acceptedAction$: TUniqueBehaviorSubject<ILinkerAction>;
  acceptAction(action?: ILinkerAction): void;
  rejectAction(): void;
  buildActionUrl<P = any, F = any>(action: ILinkerAction<P, F>, toApp?: IAppAttributes): string;
}

export interface ILinkerOptions {
  app?: IAppAttributes;
  autoAcceptActions?: boolean;
}

export interface ILinkerActionSender<T = any> {
  type: LinkerActionSenderTypes;
  data: T;
}

export interface ILinkerAction<P = any, F = any> {
  type: LinkerActionsTypes;
  sender?: ILinkerActionSender<F>;
  payload: P;
}
