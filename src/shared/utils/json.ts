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
        value = Buffer.from(value.data);
        break;
      case "BN":
        value = new BN(value.data, 16);
        break;
    }
  }
  return value;
}

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
      data: [
        ...data,
      ],
    };
  } else if (BN.isBN(data)) {
    value = {
      type: "BN",
      data: (data as BN.IBN).toString(16),
    };
  }

  return value;
}
