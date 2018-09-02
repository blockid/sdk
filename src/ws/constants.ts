import * as BN from "bn.js";
import { Type, Namespace } from "protobufjs";

export enum WsMessageTypes {
  // session
  SessionCreated = 0x01,
  VerifySession = 0x02,
  SessionVerified = 0x03,
  MuteSession = 0x04,
  UnMuteSession = 0x05,

  // personal messages
  VerifyPersonalMessage = 0x13,
  SignedPersonalMessage = 0x14,

  // identity
  IdentityCreated = 0x21,
  IdentityUpdated = 0x22,

  // member
  MemberAdded = 0x31,
  MemberLimitUpdated = 0x32,
  MemberManagerUpdated = 0x33,
  MemberRemoved = 0x34,
}

export enum WsMessagePayloadTypeNames {
  Session = "Session",
  SignedSession = "SignedSession",
  SignedPersonalMessage = "SignedPersonalMessage",
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
        [ WsMessagePayloadTypeNames.SignedPersonalMessage ]: {
          fields: {
            recipient: {
              type: "bytes",
              id: 1,
              rule: "optional",
            },
            signer: {
              type: "bytes",
              id: 2,
              rule: "optional",
            },
            signature: {
              type: "bytes",
              id: 3,
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
  recipient: String,
  signer: String,
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
  SignedPersonalMessage: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.SignedPersonalMessage),
  Identity: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.Identity),
  Member: wsMessagePayloadNamespace.lookupType(WsMessagePayloadTypeNames.Member),
};
