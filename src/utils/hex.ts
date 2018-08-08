import * as BN from "bn.js";

export interface IAnyToHexOptions {
  length?: number;
  add0x?: boolean;
}

export function anyToHex(data: any = Buffer.alloc(0), { length, add0x }: IAnyToHexOptions = {}): string {
  let result: string = null;

  if (data) {
    switch (typeof data) {
      case "number":
        result = (data as number).toString(16);
        break;

      case "string":
        if ((data as string).startsWith("0x")) {
          result = (data as string).slice(2);
        } else {
          result = Buffer.from(data, "utf8").toString("hex");
        }
        break;

      case "object":
        if (Buffer.isBuffer(data)) {
          result = (data as Buffer).toString("hex");
        } else if (BN.isBN(data)) {
          result = (data as BN.IBN).toString(16);
        }
        break;
    }
  }

  if (result !== null) {
    result = result.toLowerCase();

    if (length) {
      result = `${"0".repeat(length - result.length)}${result}`;
    }

    if (add0x) {
      result = `0x${result}`;
    }
  }

  return result;
}
