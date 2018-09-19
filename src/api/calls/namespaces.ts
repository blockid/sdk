import { IEnsAttributes } from "../../ens";
import { IRegistryAttributes } from "../../registry";
import { INetworkAttributes } from "../../network";

export namespace ApiCalls {

  export interface IRequest<T> {
    method?: string;
    path?: string;
    data?: T;
  }

  export interface IResponse<T = any> {
    status: number;
    error?: any;
    data?: T;
  }

  export namespace Responses {
    export interface ISharedAccount {
      address: string;
    }

    export interface ISettings {
      ens: IEnsAttributes;
      network: INetworkAttributes;
      registry: IRegistryAttributes;
    }
  }
}
