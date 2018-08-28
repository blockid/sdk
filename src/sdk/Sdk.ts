import { Subject, concat } from "rxjs";
import { filter } from "rxjs/operators";
import { generateRandomPrivateKey } from "../shared";
import { Api, ApiStates, IApi } from "../api";
import { Device, IDevice } from "../device";
import { Ens, IEns } from "../ens";
import { Identity, IIdentity } from "../identity";
import { INetwork, Network, NetworkProvider } from "../network";
import { IRegistry, Registry } from "../registry";
import { IStorage, Storage } from "../storage";
import { ISdk, ISdkOptions } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  /**
   * error subject
   */
  public error$ = new Subject<any>();

  /**
   * api
   */
  public api: IApi;

  /**
   * device
   */
  public device: IDevice;

  /**
   * ens
   */
  public ens: IEns;

  /**
   * identity
   */
  public identity: IIdentity;

  /**
   * network
   */
  public network: INetwork;

  /**
   * registry
   */
  public registry: IRegistry;

  private networkProvider = new NetworkProvider();

  private storage: IStorage;

  /**
   * constructor
   * @param options
   */
  constructor(options: ISdkOptions) {
    this.network = new Network(this.networkProvider);
    this.ens = new Ens(this.network);
    this.device = new Device(this.network);
    this.api = new Api(this.device, options.api);
    this.identity = new Identity(this.api, this.device);
    this.registry = new Registry(this.api, this.network, this.device);
    this.storage = new Storage(options.storage);

    concat<any>(
      this.api.state$,
      this.device.address$,
    )
      .pipe(
        filter(() => (
          this.device.address &&
          this.api.state === ApiStates.Connected
        )),
      )
      .subscribe(() => this.wrapVoidAsync(this.api.verifySession()));

    this.setupDevice();
  }

  private setupDevice(): void {
    this.wrapVoidAsync((async () => {
      let doc = await this.storage.getDeviceDoc();

      if (!doc) {
        doc = {
          privateKey: generateRandomPrivateKey(),
        };

        await this.storage.setDeviceDoc(doc);
      }

      const { privateKey } = doc;

      this.device.setPrivateKey(privateKey);

    })());
  }

  private wrapTAsync<T = any>(promise: Promise<T>): Promise<T> {
    return promise
      .catch((err) => {
        this.error$.next(err);
        return null;
      });
  }

  private wrapVoidAsync<T = any>(promise: Promise<T>): void {
    this.wrapTAsync(promise).catch(() => null);
  }
}
