import { randomBytes } from "crypto";
import * as createSha3 from "keccak";
import { privateKeyVerify, publicKeyCreate } from "secp256k1";
import { anyToHex } from "./hex";

export function generatePrivateKey(): Buffer {
  let result: Buffer;
  for (; ;) {
    result = randomBytes(32) as Buffer;
    if (privateKeyVerify(result)) {
      break;
    }
  }

  return result;
}

export function publicKeyToAddress(publicKey: Buffer): string {
  const address = createSha3("keccak256")
    .update(publicKey.slice(1))
    .digest()
    .slice(-20);

  return anyToHex(address, { add0x: true });
}

export function privateKeyToAddress(privateKey: Buffer): string {
  const publicKey = publicKeyCreate(privateKey, false);
  return publicKeyToAddress(publicKey);
}
