import * as BN from "bn.js";
import { Type, Namespace } from "protobufjs";

export enum WsMessageTypes {
  // session
  SessionCreated = 0x01,
  VerifySession = 0x02,
  SessionVerified = 0x03,

  // identity
  IdentityCreated = 0x11,
  IdentityUpdated = 0x12,

  // member
  MemberAdded = 0x21,
  MemberLimitUpdated = 0x22,
  MemberManagerUpdated = 0x23,
  MemberRemoved = 0x24,
}

export enum WsMessagePayloadTypeNames {
  Session = "Session",
  SignedSession = "SignedSession",
  Identity = "Identity",
  Member = "Member",
}

const wsMessagePayloadNamespace = Namespace
  .fromJSON("wsMessagePayload", {
      nested: {
        [ WsMessagePayloadTypeNames.Session ]: {
          fields: {
            hash: {
              type: "bytes",
              id: 1,
            },
          },
        },
        [ WsMessagePayloadTypeNames.SignedSession ]: {
          fields: {
            signature: {
              type: "bytes",
              id: 1,
            },
          },
        },
        [ WsMessagePayloadTypeNames.Identity ]: {
          fields: {
            address: {
              type: "bytes",
              id: 1,
            },
            nonce: {
              type: "bytes",
              id: 2,
              rule: "optional",
            },
            balance: {
              type: "bytes",
              id: 3,
              rule: "optional",
            },
            ensNameHash: {
              type: "bytes",
              id: 4,
              rule: "optional",
            },
            createdAt: {
              type: "uint32",
              id: 5,
              rule: "optional",
            },
            updatedAt: {
              type: "uint32",
              id: 6,
              rule: "optional",
            },
          },
        },
        [ WsMessagePayloadTypeNames.Member ]: {
          fields: {
            identity: {
              type: "bytes",
              id: 1,
            },
            address: {
              type: "bytes",
              id: 2,
            },
            purpose: {
              type: "bytes",
              id: 3,
              rule: "optional",
            },
            limit: {
              type: "bytes",
              id: 4,
              rule: "optional",
            },
            unlimited: {
              type: "bool",
              id: 5,
              rule: "optional",
            },
            manager: {
              type: "bytes",
              id: 6,
              rule: "optional",
            },
            createdAt: {
              type: "uint32",
              id: 7,
              rule: "optional",
            },
            updatedAt: {
              type: "uint32",
              id: 8,
              rule: "optional",
            },
          },
        },
      },
    },
  )
;

export const wsMessagePayloadBytesMapper: { [ key: string ]: any } = {
  hash: Buffer,
  signature: Buffer,
  address: String,
  ensNameHash: String,
  identity: String,
  purpose: String,
  manager: String,
  nonce: BN,
  balance: BN,
  limit: BN,
};

export const wsMessagePayloadTypes: { [ key: string ]: Type } = {
  Session: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.Session),
  SignedSession: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.SignedSession),
  Identity: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.Identity),
  Member: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.Member),
};
