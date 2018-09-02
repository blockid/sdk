import { Type, BufferReader } from "protobufjs";
import * as BN from "bn.js";
import {
  WsMessageTypes,
  WsMessagePayloadTypeNames,
  wsMessagePayloadTypes,
  wsMessagePayloadBytesMapper,
} from "./constants";
import { IWsMessage } from "./interfaces";
import { anyToBuffer, anyToHex } from "../shared";

/**
 * gets ws message payload type
 * @param messageType
 */
export function getWsMessagePayloadType(messageType: WsMessageTypes): Type {
  let result: Type = null;

  switch (messageType) {
    case WsMessageTypes.SessionCreated:
      result = wsMessagePayloadTypes[ WsMessagePayloadTypeNames.Session ];
      break;
    case WsMessageTypes.VerifySession:
      result = wsMessagePayloadTypes[ WsMessagePayloadTypeNames.SignedSession ];
      break;
    case WsMessageTypes.VerifyPersonalMessage:
    case WsMessageTypes.SignedPersonalMessage:
      result = wsMessagePayloadTypes[ WsMessagePayloadTypeNames.SignedPersonalMessage ];
      break;
    case WsMessageTypes.IdentityCreated:
    case WsMessageTypes.IdentityUpdated:
      result = wsMessagePayloadTypes[ WsMessagePayloadTypeNames.Identity ];
      break;
    case WsMessageTypes.MemberAdded:
    case WsMessageTypes.MemberLimitUpdated:
    case WsMessageTypes.MemberManagerUpdated:
    case WsMessageTypes.MemberRemoved:
      result = wsMessagePayloadTypes[ WsMessagePayloadTypeNames.Member ];
      break;
  }

  return result;
}

/**
 * encodes ws message
 * @param message
 */
export function encodeWsMessage<T = any>(message: IWsMessage<T>): Buffer {
  let encoded = Buffer.alloc(0);

  const payloadType: Type = getWsMessagePayloadType(message.type);

  if (
    payloadType &&
    message.payload
  ) {
    try {
      const payload: { [ key: string ]: any } = {};

      for (const key in message.payload) {
        if (message.payload.hasOwnProperty(key)) {
          const data: any = message.payload[ key ];

          switch (wsMessagePayloadBytesMapper[ key ]) {
            case String:
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
        payloadType.encode(payload).finish() as any,
      );
    } catch (err) {
      encoded = Buffer.alloc(0);
    }
  }

  return Buffer.concat([
    Buffer.from([ message.type ]),
    encoded,
  ]);
}

/**
 * decodes ws message
 * @param data
 */
export function decodeWsMessage<T = any>(data: Buffer): IWsMessage<T> {
  let result: IWsMessage<T> = null;

  if (data.length > 0) {

    result = {
      type: data[ 0 ],
      payload: null,
    };

    const payloadType: Type = getWsMessagePayloadType(data[ 0 ]);

    if (
      payloadType &&
      data.length > 1
    ) {
      try {
        const reader = new BufferReader(data.slice(1));
        const decoded = payloadType.decode(reader) as { [ key: string ]: any };
        const payload: { [ key: string ]: any } = {};

        for (const key in decoded) {
          if (decoded.hasOwnProperty(key)) {
            const data: Buffer = decoded[ key ];

            switch (wsMessagePayloadBytesMapper[ key ]) {
              case String:
                payload[ key ] = anyToHex(data, { add0x: true, defaults: null });
                break;

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
