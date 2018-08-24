import { WsMessageTypes } from "./constants";
import { WsMessagePayloads } from "./namespaces";
import { encodeWsMessage, decodeWsMessage } from "./utils";

describe("ws", () => {
  describe("utils", () => {

    describe("encodeWsMessage()", () => {

      it("should encode message with payload", () => {
        const data = encodeWsMessage<WsMessagePayloads.ISession>({
          type: WsMessageTypes.SessionCreated,
          payload: {
            hash: Buffer.from([ 0, 1, 2 ]),
          },
        });

        expect(data.toString("hex")).toBe("010a03000102");
      });

      it("should encode message without payload", () => {
        const data = encodeWsMessage({
          type: WsMessageTypes.SessionVerified,
        });

        expect(data.toString("hex")).toEqual("03");
      });
    });
    describe("decodeWsMessage()", () => {

      it("should decode message with payload", () => {
        const message = decodeWsMessage<WsMessagePayloads.ISession>(Buffer.from("010a0300010212017b", "hex"));

        expect(message.type).toBe(WsMessageTypes.SessionCreated);
        expect(message.payload.hash).toEqual(Buffer.from([ 0, 1, 2 ]));
      });

      it("should decode message without payload", () => {
        const message = decodeWsMessage(Buffer.from("03", "hex"));

        expect(message.type).toBe(WsMessageTypes.SessionVerified);
        expect(message.payload).toBe(null);
      });
    });
  });
});
