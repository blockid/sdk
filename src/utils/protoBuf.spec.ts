import { Buffer } from "buffer";
import { IProtoBufDefinition, IProtoBufHelper, createProtoBufHelper } from "./protoBuf";

interface ITest1 {
  test: string;
}

describe("utils", () => {
  describe("protoBuf", () => {

    describe("createProtoBufHelper()", () => {

      const definition: IProtoBufDefinition = {
        name: "test",
        types: {
          Test1: {
            fields: {
              test: {
                type: "string",
                id: 1,
              },
            },
          },
        },
      };

      let helper: IProtoBufHelper;
      let encoded: Buffer;

      it("should creates helper", () => {
        helper = createProtoBufHelper(definition);

        expect(helper).toBeTruthy();
      });

      it("should encodes raw data into buffer", () => {
        encoded = helper.encode<ITest1>("Test1", {
          test: "test123",
        });

        expect(Buffer.isBuffer(encoded)).toBe(true);
      });

      it("should encodes buffer data into object", () => {
        const data = helper.decode<ITest1>("Test1", encoded);

        expect(data.test).toBe("test123");
      });
    });
  });
});
