export namespace LinkerActionPayloads {

  export interface ICreateAccountDevice {
    networkVersion: number;
    deviceAddress: string;
    accountEnsName?: string;
  }

  export interface IAccountDeviceCreated {
    networkVersion: number;
    deviceAddress: string;
    accountEnsName: string;
  }
}
