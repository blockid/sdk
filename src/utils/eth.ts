import * as createSha3 from "keccak";
import { recover } from "secp256k1";
import { publicKeyToAddress } from "./ecdsa";
import { anyToHex } from "./hex";

export function hashPersonalMessage(message: Buffer | string): Buffer {
  const hex = anyToHex(message);
  const prefix = anyToHex("\x19Ethereum Signed Message:\n" + (hex.length / 2).toString(10));

  return createSha3("keccak256")
    .update(Buffer.from(`${prefix}${hex}`, "hex"))
    .digest();
}

export function personalRecoverPublicKey(message: Buffer | string, signed: Buffer | string): Buffer {
  const messageHash = hashPersonalMessage(message);
  const signedHex = anyToHex(signed);
  const signature = Buffer.from(signedHex.slice(0, -2), "hex");
  const recovery = parseInt(signedHex.slice(-2), 16) - 27;

  return recover(
    messageHash,
    signature,
    recovery,
    false,
  );
}

export function personalRecoverAddress(message: Buffer | string, signed: Buffer | string): string {
  return publicKeyToAddress(personalRecoverPublicKey(message, signed));
}