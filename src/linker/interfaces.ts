import { TUniqueBehaviorSubject } from "rxjs-addons";
import { IAppAttributes } from "../app";
import { LinkerActionsTypes, LinkerTargetTypes } from "./constants";

export interface ILinker {
  incomingUrl$: TUniqueBehaviorSubject<string>;
  outgoingUrl$: TUniqueBehaviorSubject<string>;
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

export interface ILinkerTarget<T = any> {
  type: LinkerTargetTypes;
  data: T;
}

export interface ILinkerAction<P = any, F = any> {
  type: LinkerActionsTypes;
  from?: ILinkerTarget<F>;
  payload: P;
}
