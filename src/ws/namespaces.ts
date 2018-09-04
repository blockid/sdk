import { IBN } from "bn.js";

export namespace WsMessagePayloads {
  export interface ISession {
    hash: Buffer;
  }

  export interface ISignedSession {
    signature: Buffer;
  }

  export interface ISignedPersonalMessage {
    recipient?: string;
    signer?: string;
    signature: Buffer;
  }

  export interface IIdentity {
    address: string;
    ensNameHash?: string;
  }

  export interface IIdentityMember {
    identity: string;
    address: string;
    purpose?: string;
    limit?: IBN;
    updatedAt?: number;
  }
}
