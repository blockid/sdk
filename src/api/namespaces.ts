export namespace ApiMessagePayloads {
  export interface ISessionCreated {
    hash: Buffer;
  }

  export interface IVerifySession {
    signed: Buffer;
    member: string;
  }

  export interface IIdentity {
    address: string;
    balance?: Buffer;
    createdAt?: number;
    updatedAt?: number;
  }

  export interface IIdentityMember {
    identity: string;
    address: string;
    purpose?: string;
    limit?: Buffer;
    limited?: boolean;
    createdAt?: number;
    updatedAt?: number;
  }
}
