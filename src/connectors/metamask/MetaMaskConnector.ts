import { from, Subject } from "rxjs";
import { mergeMap, map, filter } from "rxjs/operators";
import { IMember, NetworkMember } from "../../member";
import { INetwork, Network } from "../../network";
import { MetaMaskMessageTypes } from "./constants";
import { IMetaMaskConnector, IMetaMaskMessage } from "./interfaces";
import { TMetaMaskedWindow } from "./types";

/**
 * MetaMask Connector
 */
export class MetaMaskConnector implements IMetaMaskConnector {

  public network: INetwork;
  public member: IMember;

  private message$ = new Subject<IMetaMaskMessage>();

  /**
   * constructor
   * @param win
   */
  constructor(win: TMetaMaskedWindow = window) {
    this.network = new Network();
    this.member = new NetworkMember(this.network);

    this.configureNetwork();
    this.configureMember();
    this.attachWindow(win);
  }

  private configureNetwork(): void {
    this
      .message$
      .pipe((filter(({ type, payload }) => (
        type === MetaMaskMessageTypes.EthereumProvider &&
        payload
      ))))
      .pipe(map(({ payload }) => payload))
      .pipe(mergeMap((provider) => from((async () => {
        this.network.provider = provider;
        await this.network.detectVersion();
        const [ address ] = await this.network.getAccounts();

        if (address) {
          this.member.address = address;
        }
      })())))
      .subscribe();
  }

  private configureMember(): void {
    this
      .message$
      .pipe((filter(({ type, payload }) => (
        type === MetaMaskMessageTypes.SelectedAddress &&
        payload
      ))))
      .pipe(map(({ payload }) => payload as string))
      .subscribe(this.member.address$);
  }

  private attachWindow(win: TMetaMaskedWindow) {
    win.addEventListener("message", ({ data: event }: { data: { [ key: string ]: any } }) => {
      if (!event || typeof event !== "object") {
        return;
      }

      switch (event.type) {
        case "ETHEREUM_PROVIDER_SUCCESS":
          this.message$.next({
            type: MetaMaskMessageTypes.EthereumProvider,
            payload: win.ethereum,
          });
          break;
      }

      if (
        !event.data ||
        typeof event.data !== "object" ||
        event.target !== "inpage"
      ) {
        return;
      }

      switch (event.data && event.data.name) {
        case "publicConfig":
          const { selectedAddress: payload } = event.data.data as {
            selectedAddress: string;
          };

          this.message$.next({
            type: MetaMaskMessageTypes.SelectedAddress,
            payload,
          });
          break;
      }
    });

    if (typeof win.web3 === "undefined") {
      win.postMessage({ type: "ETHEREUM_PROVIDER_REQUEST" }, "*");
    } else {
      this.message$.next({
        type: MetaMaskMessageTypes.EthereumProvider,
        payload: win.web3.currentProvider,
      });
    }
  }
}
