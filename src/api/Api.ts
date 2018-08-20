import {
  anyToBuffer,
  decodeWsMessage, encodeWsMessage,
  jsonReplacer,
  jsonReviver,
  IWsMessage,
  WsMessagePayloads,
  WsMessageTypes,
} from "blockid-core";
import "cross-fetch/polyfill";

import { BehaviorSubject, Subject } from "rxjs";
import { IMember } from "../member";
import { ApiStatus } from "./constants";
import {
  errApiConnectionAlreadyVerified,
  errApiConnectionNotReady,
  errApiConnectionNotVerified,
  errApiUndefinedOptions,
} from "./errors";
import {
  IApi,
  IApiConnection,
  IApiOptions,
  IApiRequest,
} from "./interfaces";
import { ApiResponses } from "./namespaces";
import { TApiConnectionFactory } from "./types";

/**
 * Api
 */
export class Api implements IApi {

  /**
   * status$ subject
   */
  public status$ = new BehaviorSubject<ApiStatus>(ApiStatus.Disconnected);

  /**
   * error$ subject
   */
  public error$ = new Subject<any>();

  /**
   * message$ subject
   */
  public message$ = new Subject<IWsMessage>();

  private options: IApiOptions = null;
  private connectionFactory: TApiConnectionFactory = null;
  private connection: IApiConnection = null;

  private sessionHash: Buffer = null;

  /**
   * constructor
   * @param member
   * @param options
   */
  constructor(private member: IMember, options: IApiOptions = null) {
    this.setOptions(options);
  }

  /**
   * status getter
   */
  public get status(): ApiStatus {
    return this.status$.getValue();
  }

  /**
   * status setter
   * @param status
   */
  public set status(status: ApiStatus) {
    if (this.status !== status) {
      this.status$.next(status);
    }
  }

  /**
   * sets options
   * @param options
   */
  public setOptions(options: IApiOptions): void {
    if (this.options !== options) {
      this.options = options || null;
      this.createConnection();
    }
  }

  /**
   * reconnects
   */
  public reconnect(): void {
    //
  }

  /**
   * disconnects
   */
  public disconnect(): void {
    //
  }

  // HTTP methods

  /**
   * gets settings
   */
  public getSettings(): Promise<ApiResponses.IGetSettings> {
    return this.call({
      path: "settings",
    });
  }

  // WS methods

  /**
   * verifies session
   */
  public verifySession(): void {
    const status = this.status;
    (async () => {
      switch (this.status) {
        case ApiStatus.Verified:
          throw errApiConnectionAlreadyVerified;
          // @ts-ignore
          break;

        case ApiStatus.Connected:
          break;

        default:
          throw errApiConnectionNotReady;
      }

      const signature = await this.member.personalSign(this.sessionHash);

      this.status = ApiStatus.Verifying;

      this.send<WsMessagePayloads.ISignedSession>({
        type: WsMessageTypes.VerifySession,
        payload: {
          signature: anyToBuffer(signature),
        },
      }, false);

    })().catch((err) => {
      this.status = status;
      this.error$.next(err);
    });
  }

  private buildEndpoint(protocol: "http" | "ws"): string {
    const { host, port, ssl } = this.options;
    return `${protocol}${ssl ? "s" : ""}://${host || "localhost"}${port ? `:${port}` : ""}`;
  }

  private createConnection(): void {
    if (this.connection) {
      this.connection.disconnect();
    }

    const connectionFactory = this.options && this.options.connectionFactory
      ? this.options.connectionFactory
      : null;

    this.connectionFactory = connectionFactory;
    this.connection = connectionFactory
      ? connectionFactory(this.buildEndpoint("ws"))
      : null;

    if (this.connection) {
      const { connected$, error$, data$ } = this.connection;

      connected$
        .subscribe((connected) => {
          switch (connected) {
            case null:
              this.status = ApiStatus.Connecting;
              break;

            case false:
              this.status = ApiStatus.Disconnected;
              break;
          }

          this.sessionHash = null;
        });

      data$
        .subscribe((data) => {
          const message = decodeWsMessage(data);

          if (message) {
            const { type, payload } = message;
            switch (type) {
              case WsMessageTypes.SessionCreated:
                const { hash } = payload as WsMessagePayloads.ISession;
                this.sessionHash = anyToBuffer(hash);
                this.status = ApiStatus.Connected;
                break;

              case WsMessageTypes.SessionVerified:
                this.status = ApiStatus.Verified;
                break;
            }

            this.message$.next(message);
          }
        });

      error$
        .subscribe(this.error$);

      this.connection.connect();
    } else {
      this.status = ApiStatus.Disconnected;
    }
  }

  private send<T = any>(message: IWsMessage<T>, verifiedConnectionOnly: boolean = true): void {
    const data: Buffer = encodeWsMessage(message);

    if (!data) {
      return;
    }

    switch (this.status) {
      case ApiStatus.Connected:
      case ApiStatus.Verifying:
        if (verifiedConnectionOnly) {
          throw errApiConnectionNotVerified;
        }
        break;

      case ApiStatus.Verified:
        break;

      default:
        throw errApiConnectionNotReady;
    }

    this.connection.send(data);
  }

  private async call(req: IApiRequest): Promise<any> {
    if (!this.options) {
      throw errApiUndefinedOptions;
    }

    let result: any = null;

    const { mock } = this.options;

    if (mock) {
      result = await mock(req);
    } else {

      const { path } = req;
      let { method, options } = req;

      method = method || "GET";
      options = {
        headers: {},
        body: {},
        ...(options || {}),
      };

      const { headers, body } = options;

      const res = await fetch(`${this.buildEndpoint("http")}/${path}`, {
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
      result = JSON.parse(text, jsonReviver);
    }

    return result;
  }
}
