import { anyToHex } from "./hex";

const ADDRESS_LENGTH = 40;
const ZERO_ADDRESS = `0x${"0".repeat(ADDRESS_LENGTH)}`;

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
