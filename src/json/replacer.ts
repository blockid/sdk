import * as BN from "bn.js";

/**
 * json replacer
 * @param key
 * @param value
 */
export function jsonReplacer(key: string, value: any): any {
  const data = this[ key ];

  if (Buffer.isBuffer(data)) {
    value = {
      type: "Buffer",
      data: (data as Buffer).toString("hex"),
    };
  } else if (BN.isBN(data)) {
    value = {
      type: "BN",
      data: (data as BN.IBN).toString(16),
    };
  }

  return value;
}
