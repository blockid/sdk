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
  }

  export interface IIdentityMember {
    address: string;
    purpose: string;
    limit: IBN;
    manager: string;
    updatedAt: number;
  }
}
