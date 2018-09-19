import * as BN from "bn.js";

/**
 * json reviver
 * @param key
 * @param value
 */
export function jsonReviver(key: any, value: any): any {
  if (
    value &&
    typeof value === "object" &&
    value.type
  ) {
    switch (value.type) {
      case "Buffer":
        value = Buffer.from(value.data, "hex");
        break;
      case "BN":
        value = new BN(value.data, 16);
        break;
    }
  }
  return value;
}
