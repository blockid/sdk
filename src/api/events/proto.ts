import { Type, Namespace } from "protobufjs";

export enum ApiEventsPayloadProtoTypeNames {
  Account = "Account",
  AccountDevice = "AccountDevice",
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
      },
    },
  );

export const apiEventsPayloadProtoTypes: { [ key: string ]: Type } = {
  Account: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.Account),
  AccountDevice: apiEventsPayloadProto.lookupType(ApiEventsPayloadProtoTypeNames.AccountDevice),
};
