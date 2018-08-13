import * as BN from "bn.js";

export interface IAnyToBufferOptions {
  size?: number;
}

export function anyToBuffer(data: any = Buffer.alloc(0), { size }: IAnyToBufferOptions = {}): Buffer {
  let result: Buffer = Buffer.alloc(0);

  if (data) {
    switch (typeof data) {
      case "number": {
        let hex = (data as number).toString(16);
        if (hex.length % 2) {
          hex = `0${hex}`;
        }
        result = Buffer.from(hex, "hex");
        break;
      }

      case "string":
        if ((data as string).startsWith("0x") && (data as string).length % 2 === 0) {
          result = Buffer.from((data as string).slice(2), "hex");
        } else {
          result = Buffer.from(data, "utf8");
        }
        break;

      case "object":
        if (Buffer.isBuffer(data)) {
          result = data;
        } else if (BN.isBN(data)) {
          result = (data as BN.IBN).toBuffer();
        } else if (data instanceof Uint8Array) {
          result = Buffer.from([
            ...data,
          ]);
        }
        break;
    }
  }

  if (size && result.length < size) {
    result = Buffer.concat([
      Buffer.alloc(size - result.length, 0),
      result,
    ]);
  }

  return result;
}
