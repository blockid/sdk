import { of, from, Subject } from "rxjs";
import { mergeMap, map, filter, catchError } from "rxjs/operators";
import { Api } from "../../api";
import { Member } from "../../member";
import { Network } from "../../network";
import { ISdk } from "../../sdk";
import { errNetworkInvalidVersion, errApiUnsupportedNetwork } from "../../errors";
import { MetaMaskMessageTypes } from "./constants";
import { IMetaMaskMessage, IMetaMaskConnectorOptions } from "./interfaces";
import { TMetaMaskedWindow } from "./types";

/**
 * MetaMask Connector
 */
export class MetaMaskConnector {

  /**
   * metamask messages
   */
  public static message$ = new Subject<IMetaMaskMessage>();

  /**
   * connects
   * @param options
   * @param win
   */
  public static connect(options: IMetaMaskConnectorOptions, win?: TMetaMaskedWindow): ISdk {
    const error$ = new Subject<any>();
    const network = new Network();
    const member = new Member(network);
    const api = new Api(member);

    // eth provider
    const ethProvider = this.message$
      .pipe((filter(({ type, payload }) => (
        type === MetaMaskMessageTypes.EthProvider &&
        payload
      ))))
      .pipe(map(({ payload }) => payload))
      .pipe(mergeMap((provider) => from((async () => {
        network.setProvider(provider);
        const version = await network.detectVersion();

        if (!options.api[ version ]) {
          throw errApiUnsupportedNetwork;
        }

        api.setOptions(options.api[ version ] || null);

        const settings = await api.getSettings();

        if (version !== settings.network.version) {
          throw errNetworkInvalidVersion;
        }

        network.setVersion(version);

        const [ address ] = await network.getAccounts();

        if (address) {
          member.setAddress(address);
        }
      })()).pipe(catchError((err) => of(err)))));

    // selected address
    const selectedAddress = this
      .message$
      .pipe((filter(({ type }) => (
        type === MetaMaskMessageTypes.SelectedAddress
      ))))
      .pipe(map(({ payload }) => payload as string))
      .pipe(mergeMap((address) => from((async () => {
        member.setAddress(address || null);
      })()).pipe(catchError((err) => of(err)))));

    of(ethProvider, selectedAddress)
      .pipe(mergeMap((value) => value))
      .pipe(filter((value) => !!value))
      .subscribe(error$);

    this.attachWindow(win);

    return {
      error$,
      api,
      member,
      network,
    };
  }

  private static attachedWindow: TMetaMaskedWindow;

  private static attachWindow(win: TMetaMaskedWindow): void {
    if (
      typeof win === "undefined" &&
      typeof window !== "undefined"
    ) {
      win = window;
    }

    if (!win || this.attachedWindow) {
      return;
    }

    this.attachedWindow = win;

    win.addEventListener("message", ({ data: event }: { data: { [ key: string ]: any } }) => {
      if (!event || typeof event !== "object") {
        return;
      }

      switch (event.type) {
        case "ETHEREUM_PROVIDER_SUCCESS":
          this.message$.next({
            type: MetaMaskMessageTypes.EthProvider,
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
          const { selectedAddress } = event.data.data as {
            selectedAddress: string;
          };

          this.message$.next({
            type: MetaMaskMessageTypes.SelectedAddress,
            payload: selectedAddress || null,
          });
          break;
      }
    });

    if (typeof win.web3 === "undefined") {
      win.postMessage({ type: "ETHEREUM_PROVIDER_REQUEST" }, "*");
    } else {
      this.message$.next({
        type: MetaMaskMessageTypes.EthProvider,
        payload: win.web3.currentProvider,
      });
    }
  }
}
