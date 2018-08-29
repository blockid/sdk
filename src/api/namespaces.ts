import { IBN } from "bn.js";
import { IEnsAttributes } from "../ens";
import { IRegistryAttributes } from "../registry";
import { INetworkAttributes } from "../network";

export namespace ApiResponses {

  export interface ISettings {
    ens: IEnsAttributes;
    network: INetworkAttributes;
    registry: IRegistryAttributes;
  }

  export interface IIdentity {
    address: string;
    nonce: IBN;
    balance: IBN;
    createdAt: number;
    updatedAt: number;
  }

  export interface IMember {
    address: string;
    purpose: string;
    limit: IBN;
    unlimited: boolean;
    manager: string;
    createdAt: number;
    updatedAt: number;
  }
}
