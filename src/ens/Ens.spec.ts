import { Ens } from "./Ens";
import { Network, NetworkProvider } from "../network";

describe.skip("ens", () => {
  describe("Ens", () => {

    const network = new Network({
      customProvider: new NetworkProvider("http://localhost:8545"),
    });
    const ADDRESS = "0x137722198c37dd500e0a304160cb57a2c8af347f";
    const RESOLVER_ADDRESS = "0xd373171f3f9b3da8552287174583dd57843c7002";

    describe("lookup()", () => {

      it("should returns taken supported record", async () => {
        const ens = new Ens(network);

        ens.attributes = {
          address: ADDRESS,
          resolverAddress: RESOLVER_ADDRESS,
        };

        const record = await ens.lookup("admin.blockid.test");

        expect(record.address).not.toBeNull();
      });
    });
  });
});
