import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import { IDevice } from "../device";
import { UniqueBehaviorSubject } from "../shared";
import {
  decodeWsMessage,
  encodeWsMessage,
  IWsMessage,
  WsMessagePayloads,
  WsMessageTypes,
} from "../ws";
import { ApiConnection } from "./ApiConnection";
import { ApiStatus } from "./constants";
import { IApi, IApiOptions } from "./interfaces";
import { errApiInvalidStatus } from "./errors";

/**
 * Api
 */
export class Api implements IApi {

  /**
   * options subject
   */
  public options$ = new UniqueBehaviorSubject<IApiOptions>();

  /**
   * status subject
   */
  public status$ = new UniqueBehaviorSubject<ApiStatus>(ApiStatus.Disconnected);

  /**
   * ws message subject
   */
  public wsMessage$ = new Subject<IWsMessage>();

  private connection = new ApiConnection();

  private sessionHash: Buffer = null;

  /**
   * constructor
   * @param device
   * @param options
   */
  constructor(private device: IDevice, options: IApiOptions = null) {
    this
      .options$
      .subscribe(() => this.connect());

    const { connected$, data$ } = this.connection;

    connected$
      .pipe(
        tap(() => {
          this.sessionHash = null;
        }),
        map((connected) => {
          let result: ApiStatus = null;
          switch (connected) {
            case null:
              result = ApiStatus.Connecting;
              break;
            case false:
              result = ApiStatus.Disconnected;
              break;
          }
          return result;
        }),
        filter((value) => !!value),
      )
      .subscribe(this.status$);

    data$
      .pipe(
        map(decodeWsMessage),
      )
      .subscribe(this.wsMessage$);

    this
      .wsMessage$
      .pipe(
        map(({ type, payload }) => {
          let result: ApiStatus = null;
          switch (type) {
            case WsMessageTypes.SessionCreated:
              const { hash } = payload as WsMessagePayloads.ISession;
              this.sessionHash = hash;
              result = ApiStatus.Connected;
              break;

            case WsMessageTypes.SessionVerified:
              result = ApiStatus.Verified;
              break;
          }
          return result;
        }),
        filter((value) => !!value),
      )
      .subscribe(this.status$);

    this.options = options;
  }

  /**
   * options getter
   */
  public get options(): IApiOptions {
    return this.options$.value;
  }

  /**
   * options setter
   * @param options
   */
  public set options(options: IApiOptions) {
    this.options$.next(options ? {
      host: "localhost",
      port: null,
      ssl: false,
      ...options,
    } : null);
  }

  /**
   * status getter
   */
  public get status(): ApiStatus {
    return this.status$.value;
  }

  /**
   * status setter
   * @param status
   */
  public set status(status: ApiStatus) {
    this.status$.next(status);
  }

  /**
   * connects
   */
  public connect(): void {
    this
      .connection
      .connect(this.getEndpoint("ws"));
  }

  /**
   * verifies session
   */
  public async verifySession(): Promise<void> {
    const signature = await this.device.signPersonalMessage(this.sessionHash);

    this.send<WsMessagePayloads.ISignedSession>({
      type: WsMessageTypes.VerifySession,
      payload: {
        signature,
      },
    }, ApiStatus.Connected);
  }

  private getEndpoint(protocol: "ws" | "http"): string {
    let result: string = null;

    if (this.options) {
      const { host, port, ssl } = this.options;
      result = `${protocol}${ssl ? "s" : ""}://${host}${port ? `:${port}` : ""}`;
    }

    return result;
  }

  private send<T = any>(message: IWsMessage<T>, requiredStatus = ApiStatus.Verified): void {
    if (this.status !== requiredStatus) {
      throw errApiInvalidStatus;
    }

    const data = encodeWsMessage(message);
    this.connection.send(data);
  }
}
