import "cross-fetch/polyfill";

import { BehaviorSubject, Subject } from "rxjs";
import {
  errApiConnectionAleadyVerified,
  errApiConnectionNotReady,
  errApiConnectionNotVerified,
  errApiInvalidMessagePayload,
  errApiInvalidMessageType,
  errApiUndefinedOptions,
} from "../errors";
import { IMember } from "../member";
import {
  anyToBuffer,
  jsonReplacer,
  jsonReviver,
  createProtoBufHelper,
  IProtoBufHelper,
} from "../utils";
import { ApiMessageTypes, ApiStatus, API_PROTO_BUF_DEFINITION } from "./constants";
import {
  IApi,
  IApiConnection,
  IApiMessage,
  IApiOptions,
  IApiRequest,
  IApiResponseSettings,
} from "./interfaces";
import { ApiMessagePayloads } from "./namespaces";
import { TApiConnectionFactory } from "./types";

/**
 * Api
 */
export class Api implements IApi {

  /**
   * creates browser connection factory
   */
  public static createBrowserConnectionFactory(): TApiConnectionFactory {
    let result: TApiConnectionFactory = null;

    if (typeof WebSocket !== "undefined") {
      result = (endpoint: string) => {
        const connected$ = new Subject<boolean>();
        const error$ = new Subject<any>();
        const data$ = new Subject<Buffer>();

        let ws: WebSocket = null;

        const onOpen = () => {
          ws.removeEventListener("open", onOpen);
          ws.removeEventListener("close", onOpenError);
          ws.removeEventListener("error", onOpenError);

          ws.addEventListener("close", onClose);
          ws.addEventListener("error", onError);

          connected$.next(true);
        };

        const onOpenError = () => {
          ws.removeEventListener("open", onOpen);
          ws.removeEventListener("close", onOpenError);
          ws.removeEventListener("error", onOpenError);
          ws.removeEventListener("message", onMessage);

          connected$.next(false);
        };

        const onMessage = ({ data }: WebSocketEventMap["message"]) => {
          data$.next(Buffer.from(data));
        };

        const onClose = () => {
          connected$.next(false);
        };

        const onError = (event: WebSocketEventMap["error"]) => {
          error$.next(event);
        };

        const connect = () => {
          ws = new WebSocket(endpoint);
          ws.binaryType = "arraybuffer";

          connected$.next(null);

          ws.addEventListener("open", onOpen);
          ws.addEventListener("close", onOpenError);
          ws.addEventListener("error", onOpenError);
          ws.addEventListener("message", onMessage);
        };

        const disconnect = () => {
          connected$.unsubscribe();
          error$.unsubscribe();
          data$.unsubscribe();

          if (ws) {
            ws.close(100);
          }
        };

        const send = (data: Buffer) => {
          if (ws) {
            ws.send(data);
          }
        };

        return {
          connected$,
          error$,
          data$,
          connect,
          disconnect,
          send,
        };
      };
    }

    return result;
  }

  private static protoBufHelper: IProtoBufHelper = createProtoBufHelper(API_PROTO_BUF_DEFINITION);

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
  public message$ = new Subject<IApiMessage>();

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
   * gets status
   */
  public getStatus(): ApiStatus {
    return this.status$.getValue();
  }

  /**
   * sets status
   * @param status
   */
  public setStatus(status: ApiStatus): void {
    if (this.getStatus() !== status) {
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
  public getSettings(): Promise<IApiResponseSettings> {
    return this.call<IApiResponseSettings>({
      path: "settings",
    });
  }

  // WS methods

  /**
   * verifies session
   */
  public verifySession(): void {
    (async () => {
      switch (this.getStatus()) {
        case ApiStatus.Verified:
          throw errApiConnectionAleadyVerified;
          // @ts-ignore
          break;

        case ApiStatus.Connected:
          break;

        default:

          throw errApiConnectionNotReady;
      }

      const signed = await this.member.personalSign(this.sessionHash);

      this.setStatus(ApiStatus.Verifying);

      this.send<ApiMessagePayloads.IVerifySession>({
        type: ApiMessageTypes.VerifySession,
        payload: {
          signed: anyToBuffer(signed),
          member: this.member.getAddress(),
        },
      }, false);

    })().catch((err) => {
      this.setStatus(ApiStatus.Connected);
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
              this.setStatus(ApiStatus.Connecting);
              break;

            case false:
              this.setStatus(ApiStatus.Disconnected);
              break;
          }

          this.sessionHash = null;
        });

      data$
        .subscribe((data) => {
          const type = data[ 0 ];
          const payloadBuff = data.slice(1);
          let payload: any = null;

          switch (type) {
            case ApiMessageTypes.SessionCreated:
              payload = Api.protoBufHelper.decode<ApiMessagePayloads.ISessionCreated>(type, payloadBuff);
              const { hash } = payload;
              this.sessionHash = anyToBuffer(hash);
              this.setStatus(ApiStatus.Connected);
              break;

            case ApiMessageTypes.SessionVerified:
              this.setStatus(ApiStatus.Verified);
              break;
          }

          if (payload) {
            this.message$.next({
              type,
              payload,
            });
          }
        });

      error$
        .subscribe(this.error$);

      this.connection.connect();
    } else {
      this.setStatus(ApiStatus.Disconnected);
    }
  }

  private send<T = any>({ type, payload }: IApiMessage<T>, verifiedConnectionOnly: boolean = true): void {
    let payloadBuff: Buffer = null;

    switch (type) {
      case ApiMessageTypes.VerifySession:
        payloadBuff = Api.protoBufHelper.encode(type, payload);
        break;

      default:
        throw errApiInvalidMessageType;
    }

    if (!payloadBuff) {
      throw errApiInvalidMessagePayload;
    }

    switch (this.getStatus()) {
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

    const data = Buffer.concat([
      Buffer.from([ type ]),
      anyToBuffer(payloadBuff),
    ]);

    this.connection.send(data);
  }

  private async call<T = any>(req: IApiRequest): Promise<T> {
    if (!this.options) {
      throw errApiUndefinedOptions;
    }

    let result: T = null;

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
