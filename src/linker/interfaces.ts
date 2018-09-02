import { TUniqueBehaviorSubject } from "../shared";
import { LinkerActionsTypes, LinkerTargetTypes } from "./constants";

export interface ILinker {
  incomingUrl$: TUniqueBehaviorSubject<string>;
  outgoingUrl$: TUniqueBehaviorSubject<string>;
  incomingAction$: TUniqueBehaviorSubject<ILinkerAction>;
  acceptedAction$: TUniqueBehaviorSubject<ILinkerAction>;
  acceptAction(action?: ILinkerAction): void;
  rejectAction(): void;
  buildActionUrl<F = any, P = any>(action: ILinkerAction<ILinkerApp, F, P>): string;
}

export interface ILinkerOptions {
  app?: ILinkerApp;
}

export interface ILinkerApp {
  name: string;
  description?: string;
  callbackUrl?: string;
}

export interface ILinkerTarget<T = any> {
  type: LinkerTargetTypes;
  data: T;
}

export interface ILinkerAction<T = any, F = any, P = any> {
  type: LinkerActionsTypes;
  to?: ILinkerTarget<T>;
  from?: ILinkerTarget<F>;
  payload: P;
}
