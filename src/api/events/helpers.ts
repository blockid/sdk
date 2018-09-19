import { Type, BufferReader } from "protobufjs";
import * as BN from "bn.js";
import { anyToBuffer } from "eth-utils";
import {
  apiEventsPayloadProtoBytesMapper,
  ApiEventsPayloadProtoTypeNames,
  apiEventsPayloadProtoTypes,
} from "./proto";
import { IApiEvent } from "./interfaces";
import { ApiEvents } from "./namespaces";

function getPayloadProtoType(eventType: ApiEvents.Types): Type {
  let result: Type = null;

  switch (eventType) {
    case ApiEvents.Types.SessionCreated:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.Session ];
      break;

    case ApiEvents.Types.VerifySession:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.SignedSession ];
      break;

    case ApiEvents.Types.SharedAccountDeployed:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.SharedAccount ];
      break;

    case ApiEvents.Types.SharedAccountMemberAdded:
    case ApiEvents.Types.SharedAccountMemberLimitUpdated:
    case ApiEvents.Types.SharedAccountMemberManagerUpdated:
    case ApiEvents.Types.SharedAccountMemberRemoved:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.SharedAccountMember ];
      break;
  }

  return result;
}

/**
 * encodes api event
 * @param event
 */
export function encodeApiEvent<T = any>(event: IApiEvent<T>): Buffer {
  let encoded = Buffer.alloc(0);

  const payloadProtoType: Type = getPayloadProtoType(event.type);

  if (
    payloadProtoType &&
    event.payload
  ) {
    try {
      const payload: { [ key: string ]: any } = {};

      for (const key in event.payload) {
        if (event.payload.hasOwnProperty(key)) {
          const data: any = event.payload[ key ];

          switch (apiEventsPayloadProtoBytesMapper[ key ]) {
            case Buffer:
            case BN:
              payload[ key ] = anyToBuffer(data);
              break;

            default:
              payload[ key ] = data;
          }
        }
      }

      encoded = anyToBuffer(
        payloadProtoType.encode(payload).finish() as any,
      );
    } catch (err) {
      encoded = Buffer.alloc(0);
    }
  }

  return Buffer.concat([
    Buffer.from([ event.type ]),
    encoded,
  ]);
}

/**
 * decodes api event
 * @param data
 */
export function decodeApiEvent<T = any>(data: Buffer): IApiEvent<T> {
  let result: IApiEvent<T> = null;

  if (data.length > 0) {

    result = {
      type: data[ 0 ],
      payload: null,
    };

    const payloadProtoType: Type = getPayloadProtoType(result.type);

    if (
      payloadProtoType &&
      data.length > 1
    ) {
      try {
        const reader = new BufferReader(data.slice(1));
        const decoded = payloadProtoType.decode(reader) as { [ key: string ]: any };
        const payload: { [ key: string ]: any } = {};

        for (const key in decoded) {
          if (decoded.hasOwnProperty(key)) {
            const data: Buffer = decoded[ key ];

            switch (apiEventsPayloadProtoBytesMapper[ key ]) {
              case Buffer:
                payload[ key ] = Buffer.from([ ...data ]);
                break;

              case BN:
                payload[ key ] = new BN(data.toString("hex"), 16);
                break;

              default:
                payload[ key ] = data;
            }
          }
        }

        result.payload = payload as any;
      } catch (err) {
        result.payload = null;
      }
    }
  }

  return result;
}
