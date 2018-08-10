import * as Eth from "ethjs";
import { BehaviorSubject } from "rxjs";
import { anyToHex } from "../utils";
import { errNetworkUnknownProvider } from "../errors";
import { NetworkVersions } from "./constants";
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
   * detects version
   */
  public async detectVersion(): Promise<NetworkVersions> {
    const version: any = await this.eth.net_version();
    return version || null;
  }

  /**
   * personal sign
   * @param message
   * @param address
   */
  public personalSign(message: Buffer | string, address: string): Promise<string> {
    this.verifyProvider();

    return this.eth.personal_sign(
      anyToHex(message, { add0x: true }),
      address,
    );
  }

  /**
   * gets accounts
   */
  public async getAccounts(): Promise<string[]> {
    this.verifyProvider();

    const accounts = await this.eth.accounts();
    return accounts && accounts.length ? accounts : [];
  }

  private verifyProvider(): void {
    if (!this.eth) {
      throw errNetworkUnknownProvider;
    }
  }
}
