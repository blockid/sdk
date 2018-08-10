import * as Eth from "ethjs";
import { BehaviorSubject } from "rxjs";
import { errNetworkUnknownProvider, errNetworkInvalidStatus } from "../errors";
import { anyToHex } from "../utils";
import { NetworkStatuses, NetworkVersions } from "./constants";
import { INetwork } from "./interfaces";

/**
 * Network
 */
export class Network implements INetwork {

  /**
   * creates provider
   * @param endpoint
   */
  public static createProvider(endpoint: string): any {
    return new Eth.HttpProvider(endpoint);
  }

  /**
   * version$ subject
   */
  public readonly version$ = new BehaviorSubject<NetworkVersions>(null);

  /**
   * status$ subject
   */
  public readonly status$ = new BehaviorSubject<NetworkStatuses>(NetworkStatuses.Unknown);

  private eth: Eth.IEth = null;

  /**
   * sets provider
   * @param provider
   */
  public setProvider(provider: any) {
    this.eth = new Eth(provider);
  }

  /**
   * gets version
   */
  public getVersion(): NetworkVersions {
    return this.version$.getValue();
  }

  /**
   * sets version
   * @param version
   */
  public setVersion(version: NetworkVersions): void {
    if (this.getVersion() !== version) {
      this.version$.next(version);
    }
  }

  /**
   * gets status
   */
  public getStatus(): NetworkStatuses {
    return this.status$.getValue();
  }

  /**
   * sets status
   * @param status
   */
  public setStatus(status: NetworkStatuses): void {
    if (this.getStatus() !== status) {
      this.status$.next(status);
    }
  }

  /**
   * detects version
   */
  public async detectVersion(): Promise<NetworkVersions> {
    this.verify(false);
    const version: any = await this.eth.net_version();
    return version || null;
  }

  /**
   * personal sign
   * @param message
   * @param address
   */
  public personalSign(message: Buffer | string, address: string): Promise<string> {
    this.verify();

    return this.eth.personal_sign(
      anyToHex(message, { add0x: true }),
      address,
    );
  }

  /**
   * gets accounts
   */
  public async getAccounts(): Promise<string[]> {
    this.verify(false);

    const accounts = await this.eth.accounts();
    return accounts && accounts.length ? accounts : [];
  }

  private verify(checkStatus: boolean = true): void {
    if (!this.eth) {
      throw errNetworkUnknownProvider;
    }

    if (checkStatus && this.getStatus() !== NetworkStatuses.Supported) {
      throw errNetworkInvalidStatus;
    }
  }
}
