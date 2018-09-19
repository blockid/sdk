import { Type, Namespace } from "protobufjs";

export enum ApiEventsPayloadProtoTypeNames {
  Session = "Session",
  SignedSession = "SignedSession",
  SharedAccount = "SharedAccount",
  SharedAccountMember = "SharedAccountMember",
}

const apiEventsPayloadProto = Namespace
  .fromJSON(
    "apiEventsPayload",
    {
      nested: {
        [ ApiEventsPayloadProtoTypeNames.Session ]: {
          fields: {
            hash: {
              type: "bytes",
              id: 1,
            },
          },
        },
        [ ApiEventsPayloadProtoTypeNames.SignedSession ]: {
          fields: {
            signature: {
              type: "bytes",
              id: 1,
            },
          },
        },
        [ ApiEventsPayloadProtoTypeNames.SharedAccount ]: {
          fields: {
            address: {
              type: "string",
              id: 1,
            },
            ensName: {
              type: "string",
              id: 2,
              rule: "optional",
            },
          },
        },
        [ ApiEventsPayloadProtoTypeNames.SharedAccountMember ]: {
          fields: {
            sharedAccount: {
              type: ApiEventsPayloadProtoTypeNames.SharedAccount,
              id: 1,
            },
            address: {
              type: "string",
              id: 2,
            },
          },
        },
      },
    },
  );

export const apiEventsPayloadProtoBytesMapper: { [ key: string ]: any } = {
  hash: Buffer,
  signature: Buffer,
};

export const apiEventsPayloadProtoTypes: { [ key: string ]: Type } = {
  Session: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.Session),
  SignedSession: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.SignedSession),
  SharedAccount: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.SharedAccount),
  SharedAccountMember: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.SharedAccountMember),
};
