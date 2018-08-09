import { MetaMaskMessageTypes } from "./constants";
import { IMember } from "../../member";
import { INetwork } from "../../network";

export interface IMetaMaskConnector {
  member: IMember;
  network: INetwork;
}

export interface IMetaMaskMessage<T = any> {
  type: MetaMaskMessageTypes;
  payload: T;
}
