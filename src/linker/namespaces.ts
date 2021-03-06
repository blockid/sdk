import { IBN } from "bn.js";
import { IAccountAttributes } from "../account";
import { IAppAttributes } from "../app";
import { IDeviceAttributes } from "../device";

export namespace LinkerActionPayloads {

  export interface ICommon {
    network: {
      version: number;
    };
  }

  export interface ICreateAccountDevice extends ICommon {
    device: Partial<IDeviceAttributes>;
    app?: Partial<IAppAttributes>;
    limit?: IBN;
  }

  export interface IDeployAccountDevice extends ICommon {
    device: Partial<IDeviceAttributes>;
  }

  export interface IAccountDeviceCreated extends ICommon {
    account: Partial<IAccountAttributes>;
    device: Partial<IDeviceAttributes>;
    limit?: IBN;
  }

  export interface ISecure extends ICommon {
    hash: Buffer;
  }
}
