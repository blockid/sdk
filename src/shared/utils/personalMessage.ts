import { recover, publicKeyVerify, sign } from "secp256k1";
import { anyToBuffer } from "./buffer";
import { sha3 } from "./crypto";
import { publicKeyToAddress } from "./address";

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

          case "address":
            buffers.push(anyToBuffer(arg, {
              size: 20,
            }));
            break;

          case "bytes":
          case "string":
            buffers.push(anyToBuffer(arg));
            break;

          default:
            const matched = type.match(/\d+/g);
            let size = Array.isArray(matched) && matched.length
              ? parseInt(matched[ 0 ], 10)
              : 0;

            if (
              size &&
              size % 8 === 0
            ) {
              size = parseInt(matched[ 0 ], 10) / 8;

              buffers.push(anyToBuffer(arg, {
                size,
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
  return sha3(
    anyToBuffer("\x19Ethereum Signed Message:\n32"),
    sha3(message),
  );
}

/**
 * signs personal message
 * @param message
 * @param privateKey
 */
export function signPersonalMessage(message: Buffer | string, privateKey: Buffer): Buffer {
  const hash = hashPersonalMessage(message);
  const { recovery, signature } = sign(hash, privateKey);

  return Buffer.concat([
    signature,
    anyToBuffer(recovery + 27),
  ]);
}

/**
 * recovers public key from personal message
 * @param message
 * @param signature
 */
export function recoverPublicKeyFromPersonalMessage(message: Buffer | string, signature: Buffer | string): Buffer {
  const hash = hashPersonalMessage(message);
  const signatureBuff = anyToBuffer(signature);
  const s = signatureBuff.slice(0, -1);
  const r = signatureBuff[ signatureBuff.length - 1 ] - 27;

  let result: Buffer = null;

  try {
    const publicKey = recover(
      hash,
      s,
      r,
      false,
    );

    result = publicKeyVerify(publicKey) ? publicKey : null;
  } catch (err) {
    result = null;
  }

  return result;
}

/**
 * recovers address from personal message
 * @param message
 * @param signature
 */
export function recoverAddressFromPersonalMessage(message: Buffer | string, signature: Buffer | string): string {
  const publicKey = recoverPublicKeyFromPersonalMessage(message, signature);
  return publicKey ? publicKeyToAddress(publicKey) : null;
}
