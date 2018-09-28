import { Type, Reader } from "protobufjs";
import { anyToBuffer } from "eth-utils";
import {
  ApiEventsPayloadProtoTypeNames,
  apiEventsPayloadProtoTypes,
} from "./proto";
import { IApiEvent } from "./interfaces";
import { ApiEvents } from "./namespaces";

function getPayloadProtoType(eventType: ApiEvents.Types): Type {
  let result: Type = null;

  switch (eventType) {

    case ApiEvents.Types.AccountUpdated:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.Account ];
      break;

    case ApiEvents.Types.AccountDeviceAdded:
    case ApiEvents.Types.AccountDeviceUpdated:
    case ApiEvents.Types.AccountDeviceRemoved:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.AccountDevice ];
      break;

    case ApiEvents.Types.SignedSecureAction:
      result = apiEventsPayloadProtoTypes[ ApiEventsPayloadProtoTypeNames.SecureAction ];
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
      encoded = anyToBuffer(
        payloadProtoType.encode(event.payload).finish() as any,
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
        const reader = new Reader(data.slice(1));
        result.payload = payloadProtoType.decode(reader) as any;
      } catch (err) {
        result.payload = null;
      }
    }
  }

  return result;
}
