import * as Eth from "ethjs";
import { BehaviorSubject } from "rxjs";
import { NetworkVersions, anyToHex } from "blockid-core";
import { NetworkStatuses } from "./constants";
import { INetwork } from "./interfaces";
import { errNetworkUnknownProvider, errNetworkInvalidStatus } from "./errors";

/**
 * Network
 */
export class Network implements INetwork {

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
   * constructor
   * @param provider
   */
  constructor(provider: any = null) {
    this.setProvider(provider);
  }

  /**
   * sets provider
   * @param provider
   */
  public setProvider(provider: any = null) {
    this.eth = provider ? new Eth(provider) : null;
  }

  /**
   * version getter
   */
  public get version(): NetworkVersions {
    return this.version$.getValue();
  }

  /**
   * version setter
   * @param version
   */
  public set version(version: NetworkVersions) {
    if (this.version !== version) {
      this.version$.next(version);
    }
  }

  /**
   * status getter
   */
  public get status(): NetworkStatuses {
    return this.status$.getValue();
  }

  /**
   * status setter
   * @param status
   */
  public setStatus(status: NetworkStatuses) {
    if (this.status !== status) {
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

  private verify(checkStatus: boolean = true): void {
    if (!this.eth) {
      throw errNetworkUnknownProvider;
    }

    if (
      checkStatus &&
      this.status !== NetworkStatuses.Supported
    ) {
      throw errNetworkInvalidStatus;
    }
  }
}
