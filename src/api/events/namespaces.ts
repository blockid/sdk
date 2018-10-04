export namespace ApiEvents {
  export enum Types {

    // 0x0 - connection
    MuteConnection = 0x01,
    UnMuteConnection = 0x02,
    ConnectionMuted = 0x03,
    ConnectionUnMuted = 0x04,

    // 0x1 - account
    AccountUpdated = 0x11,

    // 0x2 - account member
    AccountDevice = 0x20,
    AccountDeviceAdded = 0x21,
    AccountDeviceUpdated = 0x22,
    AccountDeviceRemoved = 0x23,

    // 0x3 - secure action
    SignedSecureAction = 0x32,
  }

  export namespace Payloads {

    export interface IAccount {
      ensName: string;
    }

    export interface IAccountDevice {
      account: IAccount;
      address: string;
    }

    export interface ISignedSecureAction {
      signer?: string;
      recipient?: string;
      signature: string;
    }
  }
}
