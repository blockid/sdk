import { IdentityContract } from "./IdentityContract";

describe("identity", () => {
  describe("IdentityContract", () => {

    const contract = new IdentityContract();

    describe("estimateExtraGas()", () => {

      it("should estimates extra gas", async () => {

        const extraGas = contract.estimateExtraGas(
          "gasRelayedAddMember",
          1,
          "0x2152220ab60719d6f987f6de1478971c585841c7",
          "0x2152220ab60719d6f987f6de1478971c585841c7",
          2,
          true,
        );

        expect(extraGas.toNumber()).toBe(16520);
      });
    });
  });
});
