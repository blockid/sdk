import { IProtoBufDefinition } from "../utils";

export enum ApiStatus {
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Verified = "VERIFIED",
  Verifying = "VERIFYING",
  Disconnected = "DISCONNECTED",
}

export enum ApiMessageTypes {
  SessionCreated = 0x01,
  VerifySession = 0x02,
  SessionVerified = 0x03,
}

export const API_PROTO_BUF_DEFINITION: IProtoBufDefinition = {
  name: "ws",
  types: {
    [ ApiMessageTypes.SessionCreated ]: {
      fields: {
        hash: {
          type: "bytes",
          id: 1,
        },
      },
    },
    [ ApiMessageTypes.VerifySession ]: {
      fields: {
        signed: {
          type: "bytes",
          id: 1,
        },
        member: {
          type: "string",
          id: 2,
        },
      },
    },
  },
};
