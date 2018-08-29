import { publicKeyConvert, publicKeyVerify } from "secp256k1";
import { sha3 } from "./crypto";
import { anyToHex } from "./hex";

const ADDRESS_LENGTH = 40;
const ZERO_ADDRESS = `0x${"0".repeat(ADDRESS_LENGTH)}`;

/**
 * converts target to address
 * @param target
 */
export function targetToAddress(target: any): string {
  let result: string = null;

  switch (typeof target) {
    case "string":
      result = (target as string) || null;
      break;

    case "object":
      if (target && typeof target.address === "string") {
        result = target.address || null;
      }
      break;
  }

  return result;
}

/**
 * prepares address
 * @param address
 */
export function prepareAddress(address: string | Buffer): string {
  let result = anyToHex(address, {
    add0x: true,
    length: ADDRESS_LENGTH,
  });

  if (result === ZERO_ADDRESS) {
    result = null;
  }

  return result;
}

/**
 * converts public key to address
 * @param publicKey
 */
export function publicKeyToAddress(publicKey: Buffer): string {
  let result: string = null;

  try {
    publicKey = publicKeyConvert(publicKey, false);
    if (publicKeyVerify(publicKey)) {
      result = anyToHex(sha3(publicKey.slice(1)).slice(-20), {
        add0x: true,
      });
    }

  } catch (err) {
    result = null;
  }

  return result;
}
