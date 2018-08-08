import * as BN from "bn.js";

export function jsonReviver(key: any, value: any): any {
  if (value && typeof value === "object") {
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

export function jsonReplacer(key: string, value: any): any {
  const data = this[ key ];

  if (Buffer.isBuffer(data)) {
    value = {
      type: "Buffer",
      data: [
        ...value,
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
