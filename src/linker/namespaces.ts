export namespace LinkerActionPayloads {

  export interface ICreateAccountDevice {
    networkId: number;
    deviceAddress: string;
    accountEnsName?: string;
  }

  export interface IAccountDeviceCreated {
    networkId: number;
    deviceAddress: string;
    accountEnsName: string;
  }
}
