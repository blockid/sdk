import { recover } from "secp256k1";
import { publicKeyToAddress } from "./ecdsa";
import { anyToBuffer } from "./buffer";
import { sha3 } from "./crypto";

export function hashPersonalMessage(message: Buffer | string): Buffer {
  const messageBuff = anyToBuffer(message);
  return sha3(
    anyToBuffer("\x19Ethereum Signed Message:\n" + messageBuff.length),
    messageBuff,
  );
}

export function personalRecoverPublicKey(message: Buffer | string, signed: Buffer | string): Buffer {
  const messageHash = hashPersonalMessage(message);
  const signedBuff = anyToBuffer(signed);
  const signature = signedBuff.slice(0, -1);
  const recovery = signedBuff[ signedBuff.length - 1 ] - 27;

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