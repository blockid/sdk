import * as BN from "bn.js";

const MAX_DEPTH = 4;

export function isEqual(a: any, b: any, depth = 0): boolean {
  let result: boolean = false;

  if (depth <= MAX_DEPTH) {
    if (a === b) {
      result = true;
    } else {
      const aType = typeof a;
      const bType = typeof b;
      if (
        aType === bType &&
        !!a === !!b &&
        aType === "object"
      ) {
        if (
          BN.isBN(a) &&
          BN.isBN(b)
        ) {
          result = (a as BN.IBN).eq(b);
        } else if (
          Buffer.isBuffer(a) &&
          Buffer.isBuffer(b)
        ) {
          result = (a as Buffer).equals(b);
        } else if (
          Array.isArray(a) &&
          Array.isArray(b)
        ) {
          const aLength = a.length;
          const bLength = b.length;
          if (aLength === bLength) {
            result = (a as any[]).every((value, index) => isEqual(value, b[ index ], depth + 1));
          }
        } else {
          const aKeys = Object.keys(a);
          const bKeys = Object.keys(b);
          const keys = [
            ...new Set([
              ...aKeys,
              ...bKeys,
            ]),
          ];

          if (
            aKeys.length === keys.length &&
            bKeys.length === keys.length
          ) {
            result = keys.every((key) => isEqual(a[ key ], b[ key ]));
          }
        }
      }
    }
  }

  return result;
}
