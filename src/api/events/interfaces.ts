import { ApiEvents } from "./namespaces";

export interface IApiEvent<T = any> {
  type: ApiEvents.Types;
  payload?: T;
}
