import { IBN } from "bn.js";

export namespace WsMessagePayloads {
  export interface ISession {
    hash: Buffer;
  }

  export interface ISignedSession {
    signature: Buffer;
  }

  export interface IIdentity {
    address: string;
    nonce?: IBN;
    ensNameHash?: string;
    createdAt?: number;
    updatedAt?: number;
  }

  export interface IMember {
    identity: string;
    address: string;
    purpose?: string;
    limit?: IBN;
    unlimited?: boolean;
    manager?: string;
    createdAt?: number;
    updatedAt?: number;
  }
}
