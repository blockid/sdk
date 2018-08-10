import { IApiOptions } from "../../api";
import { MetaMaskMessageTypes } from "./constants";

export interface IMetaMaskMessage<T = any> {
  type: MetaMaskMessageTypes;
  payload: T;
}

export interface IMetaMaskConnectorOptions {
  api: {
    [ key: string ]: IApiOptions;
  };
}
