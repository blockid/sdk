export namespace ApiMessagePayloads {
  export interface ISessionCreated {
    hash: Buffer;
  }

  export interface IVerifySession {
    signed: Buffer;
    member: string;
  }
}
