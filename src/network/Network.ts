import * as Eth from "ethjs";
import { BehaviorSubject } from "rxjs";
import { anyToHex } from "../utils";
import { config } from "../config";
import { NetworkVersions } from "./constants";
import { INetworkOptions, INetwork } from "./interfaces";

/**
 * Network
 */
export class Network implements INetwork {

  /**
   * version$ subject
   */
  public readonly version$ = new BehaviorSubject<NetworkVersions>(null);

  private eth: Eth.IEth = null;

  private readonly endpoints: { [ key: string ]: string } = {};

  /**
   * constructor
   * @param version
   * @param endpoints
   */
  constructor({ version, endpoints }: INetworkOptions = {}) {
    this.endpoints = endpoints || config.network.endpoints;

    if (version) {
      this.switchVersion(version);
    }
  }

  /**
   * provider
   * @param provider
   */
  public set provider(provider: any) {
    this.eth = new Eth(provider);
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
   * switches version
   * @param version
   */
  public switchVersion(version: NetworkVersions): void {
    const endpoint = this.endpoints[ version ];

    if (endpoint) {
      this.provider = new Eth.HttpProvider(endpoint);
      this.version = version;
    }
  }

  /**
   * detects version
   */
  public async detectVersion(): Promise<void> {
    this.version = (await this.eth.net_version()) as any || null;
  }

  /**
   * personal sign
   * @param message
   * @param address
   */
  public async personalSign(message: Buffer | string, address: string): Promise<string> {
    let result: string = null;

    if (this.eth) {
      result = await this.eth.personal_sign(
        anyToHex(message, { add0x: true }),
        address,
      );
    }

    return result;
  }

  /**
   * gets accounts
   */
  public async getAccounts(): Promise<string[]> {
    let result: string[] = [];

    if (this.eth) {
      const accounts = await this.eth.accounts();
      result = accounts && accounts.length ? accounts : [];
    }

    return result;
  }
}