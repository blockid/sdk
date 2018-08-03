import { INetwork } from "../../network";
import { IMember } from "../../member";
import { MESSAGE_NAME, MESSAGE_TARGET, MessageTypes } from "./constants";
import { TMetaMaskedWindow } from "./types";

/**
 * MetaMask Connector
 */
export class MetaMaskConnector {

  /**
   * constructor
   * @param network
   * @param member
   */
  constructor(private network: INetwork, private member: IMember) {
    //
  }

  /**
   * detect MetaMask
   * @param win
   */
  public detect(win?: TMetaMaskedWindow): Promise<void> {
    if (!win) {
      win = window;
    }

    return new Promise<void>((resolve, reject) => {
      let timeout: any = setTimeout(() => reject(new Error("MetaMask not found")), 500);

      win.addEventListener("message", ({ data: event }: { data: { [ key: string ]: any } }) => {
        if (!event || typeof event !== "object") {
          return;
        }

        switch (event.type) {
          case MessageTypes.providerSuccess:
            resolve(this.configure(win.ethereum));
            clearTimeout(timeout);
            break;
        }

        if (
          !event.data ||
          typeof event.data !== "object" ||
          event.target !== MESSAGE_TARGET
        ) {
          return;
        }

        switch (event.data && event.data.name) {
          case MESSAGE_NAME:
            const { selectedAddress: address } = event.data.data as {
              selectedAddress: string;
            };

            this.member.address = address;
            break;
        }
      });

      if (typeof win.web3 === "undefined") {
        window.postMessage({ type: MessageTypes.providerRequest }, "*");
      } else {
        resolve(this.configure(win.web3.currentProvider));
        clearTimeout(timeout);
      }
    });
  }

  private async configure(provider: any): Promise<void> {
    this.network.provider = provider;
    await this.network.detectVersion();
    const [ address ] = await this.network.getAccounts();

    if (address) {
      this.member.address = address;
    }
  }
}
