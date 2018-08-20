import { createNetworkHttpProvider } from "./network";

describe("utils", () => {
  describe("network", () => {

    describe("createNetworkHttpProvider()", () => {

      it("should returns object", () => {
        const provider = createNetworkHttpProvider("http://localhost:8545");

        expect(typeof provider).toBe("object");
      });
    });
  });
});
