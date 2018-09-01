import { TUniqueBehaviorSubject } from "../shared";

export interface ILinker {
  url$: TUniqueBehaviorSubject<string>;
  url: string;
}

export interface ILinkerOptions {
  protocol?: string;
}
