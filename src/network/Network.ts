/* tslint:disable:variable-name */

import * as BN from "bn.js";
import { ICallOptions, ISendTransactionOptions } from "ethjs";
import { map } from "rxjs/operators";
import * as Eth from "ethjs";
import { anyToBuffer, anyToHex, sha3, UniqueBehaviorSubject } from "../shared";
import { NetworkVersions, NetworkStatuses, NETWORK_NAMES } from "./constants";
import {
  INetwork,
  INetworkBlock,
  INetworkMessageOptions, INetworkTransactionOptions,
  INetworkTransactionReceipt,
} from "./interfaces";

/**
 * Network
 */
export class Network implements INetwork {

  /**
   * version$ subject
   */
  public version$ = new UniqueBehaviorSubject<NetworkVersions>(NetworkVersions.Unknown);

  /**
   * name$ subject
   */
  public name$ = new UniqueBehaviorSubject<string>(NETWORK_NAMES[ NetworkVersions.Unknown ]);

  /**
   * status$ subject
   */
  public status$ = new UniqueBehaviorSubject<NetworkStatuses>(NetworkStatuses.Unknown);

  private eth: Eth.IEth;

  /**
   * Network
   * @param provider
   */
  constructor(provider: Eth.IProvider) {
    this.eth = new Eth(provider);

    this.version$
      .pipe(
        map((version) => NETWORK_NAMES[ version ] || null),
      )
      .subscribe(this.name$);
  }

  /**
   * version getter
   */
  public get version(): NetworkVersions {
    return this.version$.value;
  }

  /**
   * version setter
   * @param version
   */
  public set version(version: NetworkVersions) {
    this.version$.next(version);
  }

  /**
   * name getter
   */
  public get name(): string {
    return this.name$.value;
  }

  /**
   * status getter
   */
  public get status(): NetworkStatuses {
    return this.status$.value;
  }

  /**
   * status setter
   * @param status
   */
  public set status(status: NetworkStatuses) {
    this.status$.next(status);
  }

  /**
   * detects version
   */
  public detectVersion(): Promise<NetworkVersions> {
    return this
      .eth
      .net_version()
      .then((version) => NETWORK_NAMES[ version ]
        ? version
        : null,
      )
      .catch(() => null);
  }

  /**
   * gets primary account
   */
  public getPrimaryAccount(): Promise<string> {
    return this
      .eth
      .accounts()
      .catch(() => [])
      .then((accounts) => Array.isArray(accounts) && accounts[ 0 ]
        ? accounts[ 0 ]
        : null,
      );
  }

  /**
   * gets target balance
   * @param target
   */
  public async getBalance(target: any): Promise<BN.IBN> {
    let result: BN.IBN = new BN(0);
    let address: string = null;

    switch (typeof target) {
      case "string":
        address = (target as string) || null;
        break;
      case "object":
        if (target && typeof target.address === "string") {
          address = target.address || null;
        }
        break;
    }

    if (address) {
      result = await this.eth.getBalance(address, "latest");
    }

    return result;
  }

  /**
   * gets gas price
   */
  public getGasPrice(): Promise<BN.IBN> {
    return this.eth
      .gasPrice();
  }

  /**
   * gets current block number
   */
  public getBlockNumber(): Promise<BN.IBN> {
    return this.eth
      .blockNumber();
  }

  /**
   * gets block
   */
  public async getBlock(number: BN.IBN = null): Promise<INetworkBlock> {
    let result: INetworkBlock = null;
    const response = await this.eth
      .getBlockByNumber(number || "latest", true);

    if (response) {
      const { hash, number, transactions } = response;

      result = {
        hash,
        number,
        transactions: transactions.map(({ hash, from, to, nonce, value, gas, gasPrice, input }) => ({
          hash,
          from,
          to,
          nonce,
          value,
          gas,
          gasPrice,
          input,
        })),
      };
    }

    return result;
  }

  /**
   * gets transaction receipt
   */
  public async getTransactionReceipt(hash: string): Promise<INetworkTransactionReceipt> {
    let result: INetworkTransactionReceipt = null;
    const response = await this.eth
      .getTransactionReceipt(hash);

    if (response) {
      const {
        cumulativeGasUsed,
        gasUsed,
        logs,
        status,
      } = response;

      result = {
        cumulativeGasUsed,
        gasUsed,
        logs,
        success: status === "0x1",
      };
    }

    return result;
  }

  /**
   * calls message
   * @param options
   */
  public callMessage({ to, data }: INetworkMessageOptions): Promise<string> {
    const options: ICallOptions = {
      to,
      data: anyToHex(data, { add0x: true, defaults: "" }),
    };

    return this
      .eth
      .call(options, "latest");
  }

  /**
   * sends transaction
   * @param options
   */
  public sendTransaction({ to, value, gas, gasPrice, data }: INetworkTransactionOptions): Promise<string> {
    const options: ISendTransactionOptions = {
      to,
    };

    if (value) {
      options.value = anyToHex(value, { add0x: true });
    }

    if (gas) {
      options.gas = anyToHex(gas, { add0x: true });
    }

    if (gasPrice) {
      options.gasPrice = anyToHex(gasPrice, { add0x: true });
    }

    if (data) {
      options.data = anyToHex(data, { add0x: true, defaults: "" });
    }

    return this.eth
      .sendTransaction(options);
  }

  /**
   * estimates transaction
   * @param options
   */
  public estimateTransaction({ to, value, gas, gasPrice, data }: Partial<INetworkTransactionOptions>): Promise<BN.IBN> {
    const options: Partial<ISendTransactionOptions> = {};

    if (to) {
      options.to = anyToHex(to, { add0x: true });
    }

    if (value) {
      options.value = anyToHex(value, { add0x: true });
    }

    if (gas) {
      options.gas = anyToHex(gas, { add0x: true });
    }

    if (gasPrice) {
      options.gasPrice = anyToHex(gasPrice, { add0x: true });
    }

    if (data) {
      options.data = anyToHex(data, { add0x: true, defaults: "" });
    }

    return this.eth
      .estimateGas(options, "latest");
  }

  /**
   * sends raw transaction
   * @param data
   */
  public sendRawTransaction(data: string | Buffer): Promise<string> {
    return this.eth
      .sendRawTransaction(anyToHex(data, { add0x: true, defaults: "" }));
  }

  /**
   * signs personal message
   * @param message
   * @param address
   */
  public async signPersonalMessage(message: string | Buffer, address: string): Promise<Buffer> {
    const hash = sha3(message);
    const signature = this.eth.personal_sign(
      anyToHex(hash, { add0x: true, defaults: "" }),
      address,
    );

    return anyToBuffer(signature, {
      defaults: null,
    });
  }
}
