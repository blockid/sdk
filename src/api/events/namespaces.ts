export namespace ApiEvents {
  export enum Types {

    // 0x0 - session
    SessionCreated = 0x01,
    VerifySession = 0x02,
    SessionVerified = 0x03,
    MuteSession = 0x04,
    UnMuteSession = 0x05,
    SessionMuted = 0x06,
    SessionUnMuted = 0x07,

    // 0x1 - shared account
    SharedAccountDeployed = 0x12,

    // 0x2 - shared account member
    SharedAccountMemberAdded = 0x21,
    SharedAccountMemberLimitUpdated = 0x22,
    SharedAccountMemberManagerUpdated = 0x23,
    SharedAccountMemberRemoved = 0x24,
  }

  export namespace Payloads {

    export interface ISession {
      hash: Buffer;
    }

    export interface ISignedSession {
      signature: Buffer;
    }

    export interface ISharedAccount {
      address: string;
      ensName?: string;
    }

    export interface ISharedAccountMember {
      sharedAccount: ISharedAccount;
      address: string;
    }
  }
}
