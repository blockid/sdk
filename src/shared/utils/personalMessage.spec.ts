import { buildPersonalMessage } from "./personalMessage";

describe("utils", () => {
  describe("personalMessage", () => {

    describe("buildPersonalMessage()", () => {

      it("should returns valid message", () => {
        const message = buildPersonalMessage("bool", "uint256", "uint32")(true, 10, 12);

        expect(message.toString("hex"))
          .toBe("01000000000000000000000000000000000000000000000000000000000000000a0000000c");
      });
    });
  });
});
