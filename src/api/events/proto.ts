import { Type, Namespace } from "protobufjs";

export enum ApiEventsPayloadProtoTypeNames {
  Account = "Account",
  AccountDevice = "AccountDevice",
  SecureAction = "SecureAction",
}

const apiEventsPayloadProto = Namespace
  .fromJSON(
    "apiEventsPayload",
    {
      nested: {
        [ ApiEventsPayloadProtoTypeNames.Account ]: {
          fields: {
            ensName: {
              type: "string",
              id: 1,
            },
          },
        },
        [ ApiEventsPayloadProtoTypeNames.AccountDevice ]: {
          fields: {
            account: {
              type: ApiEventsPayloadProtoTypeNames.Account,
              id: 1,
            },
            address: {
              type: "string",
              id: 2,
            },
          },
        },
        [ ApiEventsPayloadProtoTypeNames.SecureAction ]: {
          fields: {
            signer: {
              type: "string",
              id: 1,
              rule: "optional",
            },
            recipient: {
              type: "string",
              id: 2,
              rule: "optional",
            },
            signature: {
              type: "string",
              id: 3,
            },
          },
        },
      },
    },
  );

export const apiEventsPayloadProtoTypes: { [ key: string ]: Type } = {
  Account: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.Account),
  AccountDevice: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.AccountDevice),
  SecureAction: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.SecureAction),
};
