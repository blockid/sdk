import { IProtoBufDefinition } from "../utils";

export enum ApiStatus {
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Verified = "VERIFIED",
  Verifying = "VERIFYING",
  Disconnected = "DISCONNECTED",
}

export enum ApiMessageTypes {
  // session
  SessionCreated = 0x01,
  VerifySession = 0x02,
  SessionVerified = 0x03,

  // identity
  Identity = 0x11,

  // identity member
  IdentityMember = 0x21,
}

export const API_PROTO_BUF_DEFINITION: IProtoBufDefinition = {
  name: "ws",
  types: {

    // session
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

    // identity
    [ ApiMessageTypes.Identity ]: {
      fields: {
        address: {
          type: "string",
          id: 1,
        },
        balance: {
          type: "bytes",
          id: 2,
          rule: "optional",
        },
        createdAt: {
          type: "uint32",
          id: 3,
          rule: "optional",
        },
        updatedAt: {
          type: "uint32",
          id: 4,
          rule: "optional",
        },
      },
    },

    // identity member
    [ ApiMessageTypes.IdentityMember ]: {
      fields: {
        identity: {
          type: "string",
          id: 1,
        },
        address: {
          type: "string",
          id: 2,
        },
        purpose: {
          type: "string",
          id: 3,
          rule: "optional",
        },
        limit: {
          type: "bytes",
          id: 4,
          rule: "optional",
        },
        limited: {
          type: "bool",
          id: 5,
          rule: "optional",
        },
        createdAt: {
          type: "uint32",
          id: 6,
          rule: "optional",
        },
        updatedAt: {
          type: "uint32",
          id: 7,
          rule: "optional",
        },
      },
    },
  },
};
