import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import { IDevice } from "../device";
import { UniqueBehaviorSubject, jsonReplacer, jsonReviver, AbstractOptionsHolder } from "../shared";
import {
  decodeWsMessage,
  encodeWsMessage,
  IWsMessage,
  WsMessagePayloads,
  WsMessageTypes,
} from "../ws";
import { ApiConnection } from "./ApiConnection";
import { ApiStatus } from "./constants";
import { IApi, IApiOptions, IApiRequest } from "./interfaces";
import { ApiResponses } from "./namespaces";
import { errApiInvalidStatus } from "./errors";

/**
 * Api
 */
export class Api extends AbstractOptionsHolder<IApiOptions> implements IApi {

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
    super(options);

    this
      .options$
      .pipe(
        filter((options) => !!options),
        tap(() => this.connect()),
      )
      .subscribe();

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
    this.verifyOptions();

    this
      .connection
      .connect(this.getEndpoint("ws"));
  }

  // socket methods

  /**
   * verifies session
   */
  public async verifySession(): Promise<void> {
    try {
      const signature = await this.device.signPersonalMessage(this.sessionHash);

      this.send<WsMessagePayloads.ISignedSession>({
        type: WsMessageTypes.VerifySession,
        payload: {
          signature,
        },
      }, ApiStatus.Connected);
    } catch (err) {
      //
    }
  }

  // http methods

  /**
   * GET /settings
   */
  public getSettings(): Promise<ApiResponses.ISettings> {
    return this.call({
      path: "settings",
    });
  }

  /**
   * GET /identity/:identity
   */
  public getIdentity(identity: string): Promise<ApiResponses.IIdentity> {
    return this.call({
      path: `identity/${identity}`,
    });
  }

  /**
   * GET /member/:identity
   */
  public getMembers(identity: string): Promise<ApiResponses.IMember[]> {
    return this.call({
      path: `member/${identity}`,
    });
  }

  /**
   * GET /member/:identity/:member
   */
  public getMember(identity: string, member: string): Promise<ApiResponses.IMember> {
    return this.call({
      path: `member/${identity}/${member}`,
    });
  }

  private getEndpoint(protocol: "ws" | "http"): string {
    const { host, port, ssl } = this.options;
    return `${protocol}${ssl ? "s" : ""}://${host}${port ? `:${port}` : ""}`;
  }

  private send<T = any>(message: IWsMessage<T>, requiredStatus = ApiStatus.Verified): void {
    if (this.status !== requiredStatus) {
      throw errApiInvalidStatus;
    }

    const data = encodeWsMessage(message);
    this.connection.send(data);
  }

  private async call<T = any>(req: IApiRequest): Promise<T> {
    this.verifyOptions();

    const endpoint = this.getEndpoint("http");

    const { path } = req;
    let { method, options } = req;

    method = method || "GET";
    options = {
      headers: {},
      body: {},
      ...(options || {}),
    };

    const { headers, body } = options;

    const res = await fetch(`${endpoint}/${path}`, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        ...headers,
      }),
      ...(
        method !== "GET" &&
        method !== "HEAD"
          ? { body: JSON.stringify(body, jsonReplacer) }
          : {}
      ),
    });

    const text = await res.text();

    return JSON.parse(text, jsonReviver);
  }
}
