import { Ens } from "./Ens";
import { getEnsNameHash } from "./utils";
import { Network, NetworkProvider } from "../network";

describe.skip("ens", () => {
  describe("Ens", () => {

    const network = new Network(null, new NetworkProvider("http://localhost:8545"));
    const ADDRESS = "0x137722198c37dd500e0a304160cb57a2c8af347f";
    const RESOLVER_ADDRESS = "0xd373171f3f9b3da8552287174583dd57843c7002";

    describe("lookup()", () => {

      it("should returns taken supported record", async () => {
        const ens = new Ens(network, {
          address: ADDRESS,
          resolverAddress: RESOLVER_ADDRESS,
          supportedRootNodes: [ {
            name: "blockid.test",
            nameHash: getEnsNameHash("blockid.test"),
          } ],
        });

        const record = await ens.lookup("admin.blockid.test");

        expect(record.supported).toBeTruthy();
        expect(record.address).not.toBeNull();
      });
    });
  });
});
