import { getEnsNameHash, getEnsLabelHash } from "./utils";

describe("ens", () => {
  describe("utils", () => {

    describe("getEnsNameHash()", () => {

      it("should returns valid hash", () => {
        expect(getEnsNameHash("block.eth"))
          .toBe("0xc34238dd60f46fdcf06e8f1ed5fd0502afdbbaf752a705ce0f2716e5ed831554");
      });

      it("should returns null for empty name", () => {
        expect(getEnsNameHash(""))
          .toBeNull();
      });
    });

    describe("getEnsLabelHash()", () => {

      it("should returns valid hash", () => {
        expect(getEnsLabelHash("block"))
          .toBe("0x20b53acf0daefc8c6ad68c861fb3b543ca541abd101abc1edfcbf6606b838ef4");
      });

      it("should returns valid hash for empty name", () => {
        expect(getEnsLabelHash(""))
          .toBeNull();
      });
    });
  });
});
