import { randomBytes } from "crypto";
import { privateKeyVerify } from "secp256k1";

/**
 * generates random private key
 */
export function generateRandomPrivateKey(): Buffer {
  let result: Buffer;
  for (; ;) {
    result = randomBytes(32) as Buffer;
    if (privateKeyVerify(result)) {
      break;
    }
  }

  return result;
}
