import * as createSha3 from "keccak";
import { anyToBuffer } from "./buffer";

export function sha3(...args: any[]): Buffer {
  return createSha3("keccak256")
    .update(Buffer.concat(
      args.map((arg) => anyToBuffer(arg)),
    ))
    .digest();
}
