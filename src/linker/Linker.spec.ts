import { isEqual } from "../shared";
import { LinkerActionsTypes, LinkerTargetTypes } from "./constants";
import { ILinkerAction } from "./interfaces";
import { Linker } from "./Linker";

describe("linker", () => {
  describe("Linker", () => {

    const linker = new Linker();

    describe("buildActionUrl()", () => {

      it("should build valid url", async () => {

        const action: ILinkerAction = {
          type: LinkerActionsTypes.SignPersonalMessage,
          from: {
            type: LinkerTargetTypes.Device,
            data: "0x0",
          },
          to: null,
          payload: Buffer.alloc(1, 1),
        };

        const url = linker.buildActionUrl<string, Buffer>(action);

        linker.url = url;

        expect(isEqual(action, { ...linker.action, to: null })).toBeTruthy();
      });
    });
  });
});
