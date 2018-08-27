import * as BN from "bn.js";
import { isEqual } from "./compare";

describe("utils", () => {
  describe("compare", () => {

    describe("isEqual()", () => {

      it("should returns true for same BN", () => {
        expect(isEqual(new BN(1), new BN(1))).toBeTruthy();
      });

      it("should returns true for same arrays", () => {
        expect(isEqual([ new BN(1) ], [ new BN(1) ])).toBeTruthy();
      });

      it("should returns true for same objects", () => {
        expect(isEqual({ a: new BN(1) }, { a: new BN(1) })).toBeTruthy();
      });

      it("should returns false for different types", () => {
        expect(isEqual(1, true)).toBeFalsy();
      });

      it("should returns false for different objects", () => {
        expect(isEqual({ a: new BN(1) }, { a: new BN(1), b: 1 })).toBeFalsy();
      });
    });
  });
});
