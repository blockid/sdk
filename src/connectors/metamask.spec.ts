import { filter } from "rxjs/operators";
import { IProvider } from "ethjs";
import { NetworkVersions } from "../network";
import { MetaMaskConnector, MetaMaskMessageTypes } from "./metamask";

describe("connectors", () => {
  describe("metamask", () => {

    const ADDRESS = "0x194eb1c67b25cc851d6037641fcd9f0b65ae7d90";

    describe("MetaMaskConnector.connect()", () => {

      it("should connect with mocked metamask", (done) => {
        const provider: IProvider = {
          sendAsync: ({ jsonrpc, id, method }, callback) => {
            let result: any = null;
            switch (method) {
              case "net_version":
                result = NetworkVersions.Rinkeby;
                break;
              case "eth_accounts":
                result = [ ADDRESS ];
                break;
            }

            callback(null, {
              jsonrpc,
              id,
              result,
            });
          },
        };

        const { error$, member, network } = MetaMaskConnector
          .connect({
            api: {
              [ NetworkVersions.Rinkeby ]: {
                mock: async ({ path }) => {
                  let result: any = null;
                  switch (path) {
                    case "settings":
                      result = {
                        network: {
                          version: NetworkVersions.Rinkeby,
                        },
                      };
                      break;
                  }
                  return result;
                },
              },
            },
          });

        error$
          .subscribe(done);

        network
          .version$
          .pipe(filter((value) => !!value))
          .subscribe(() => {
            expect(network.getVersion()).toBe(NetworkVersions.Rinkeby);
            expect(member.getAddress()).toBe(ADDRESS);
            done();
          });

        MetaMaskConnector
          .message$
          .next({
            type: MetaMaskMessageTypes.EthProvider,
            payload: provider,
          });
      });
    });
  });
});
