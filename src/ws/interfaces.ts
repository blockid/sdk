import { WsMessageTypes } from "./constants";

export interface IWsMessage<T = any> {
  type: WsMessageTypes;
  payload?: T;
}
