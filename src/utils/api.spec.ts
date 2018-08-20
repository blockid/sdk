import { createApiWebSocketConnectionFactory } from "./api";

describe("utils", () => {
  describe("api", () => {

    describe("createApiWebSocketConnectionFactory()", () => {

      it("should returns object", () => {
        const factory = createApiWebSocketConnectionFactory();

        expect(typeof factory).toBe("object");
      });
    });
  });
});
