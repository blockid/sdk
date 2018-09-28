export namespace LinkerActionPayloads {

  export interface ICommon {
    networkVersion: number;
  }

  export interface ICreateAccountDevice extends ICommon {
    deviceAddress: string;
    appName?: string;
  }

  export interface IAccountDeviceCreated extends ICommon {
    deviceAddress: string;
    accountEnsName: string;
  }

  export interface ISecure extends ICommon {
    hash: Buffer;
  }
}
