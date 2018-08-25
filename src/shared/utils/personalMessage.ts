import { anyToBuffer } from "./buffer";
import { sha3 } from "./crypto";

/**
 * builds personal message
 * @param types
 */
export function buildPersonalMessage(...types: string[]): (...args: any[]) => Buffer {
  return (...args) => {
    if (types.length !== args.length) {
      return null;
    }

    const buffers: Buffer[] = [];

    for (const index in types) {
      if (typeof args[ index ] !== "undefined") {
        const type = types[ index ];
        const arg = args[ index ];

        switch (type) {
          case "bool":
            buffers.push(anyToBuffer(!!arg));
            break;

          case "bytes":
          case "string":
            buffers.push(anyToBuffer(arg));
            break;

          default:
            const matched = type.match(/\d+/g);
            const size = Array.isArray(matched) && matched.length
              ? parseInt(matched[ 0 ], 10)
              : 0;

            if (
              size &&
              size % 8 === 0
            ) {
              buffers.push(anyToBuffer(arg, {
                size: parseInt(matched[ 0 ], 10) / 8,
              }));
            } else {
              return null;
            }
        }

      } else {
        return null;
      }
    }

    return Buffer.concat(buffers);
  };
}

/**
 * hashes personal message
 * @param message
 */
export function hashPersonalMessage(message: Buffer | string): Buffer {
  const hash = sha3(anyToBuffer(message));
  return sha3(
    anyToBuffer("\x19Ethereum Signed Message:\n" + hash.length),
    hash,
  );
}
