import { IBN } from "bn.js";
import { IEnsOptions } from "../ens";
import { IRegistryOptions } from "../registry";
import { NetworkVersions } from "../network";

export namespace ApiResponses {

  export interface ISettings {
    ens: IEnsOptions;
    network: {
      version: NetworkVersions;
      providerEndpoint: string;
    };
    registry: IRegistryOptions;
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
