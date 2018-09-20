import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { AttributesProxySubject, UniqueBehaviorSubject } from "rxjs-addons";
import { map } from "rxjs/operators";
import { jsonReplacer, jsonReviver } from "eth-utils";
import { ApiCalls } from "./calls";
import { ApiConnection, IApiConnection } from "./connection";
import { ApiStates } from "./constants";
import { errApiUnknownOptions } from "./errors";
import { ApiEvents, decodeApiEvent, encodeApiEvent, IApiEvent } from "./events";
import { IApi, IApiAttributes, IApiOptions } from "./interfaces";

/**
 * Api
 */
export class Api extends AttributesProxySubject<IApiAttributes> implements IApi {

  private static prepareAttributes(attributes: IApiAttributes): IApiAttributes {
    let result: IApiAttributes = {
      state: ApiStates.Disconnected,
    };

    if (attributes) {
      result = {
        ...result,
        ...attributes,
      };
    }

    return result;
  }

  private static buildEndpoint(protocol: "ws" | "http", options: IApiOptions = null): string {
    let result: string = null;

    if (options) {
      const { host, port, ssl } = options;
      result = `${protocol}${ssl ? "s" : ""}://${host || "localhost"}${port ? `:${port}` : ""}`;
    }

    return result;
  }

  /**
   * options subject
   */
  public options$ = new UniqueBehaviorSubject<IApiOptions>();

  /**
   * event subject
   */
  public event$ = new Subject<IApiEvent>();

  private httpEndpoint: string = null;
  private wsEndpoint: string = null;

  private reconnectInterval: any = null;

  /**
   * constructor
   * @param options
   * @param connection
   */
  constructor(options: IApiOptions = null, private connection: IApiConnection = new ApiConnection()) {
    super(null, {
      schema: {
        state: true,
      },
      prepare: Api.prepareAttributes,
    });

    this.options = options;

    this
      .options$
      .subscribe((options) => {
        this.httpEndpoint = Api.buildEndpoint("http", options);
        this.wsEndpoint = Api.buildEndpoint("ws", options);

        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
        }

        if (!options) {
          this.connection.disconnect();
          return;
        }

        const { reconnectTimeout } = options;
        const connect = () => {
          this.connection.connect(this.wsEndpoint);
        };

        connect();

        if (reconnectTimeout) {
          this.reconnectInterval = setInterval(
            () => {
              switch (this.getAttribute("state")) {
                case ApiStates.Disconnected:
                  connect();
                  break;
              }
            },
            reconnectTimeout,
          );
        }
      });

    const { connected$, data$ } = this.connection;

    connected$
      .pipe(
        map((connected) => {
          let result: ApiStates = null;
          switch (connected) {
            case null:
              result = ApiStates.Connecting;
              break;

            case true:
              result = ApiStates.Connected;
              break;

            case false:
              result = ApiStates.Disconnected;
              break;
          }
          return result;
        }),
      )
      .subscribe(this.getAttribute$("state"));

    data$
      .pipe(
        map(decodeApiEvent),
      )
      .subscribe(this.event$);
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
    this.options$.next(options);
  }

  /**
   * sends verify session
   * @param payload
   */
  public sendVerifySession(payload: ApiEvents.Payloads.ISignedSession): void {
    this.send({
      type: ApiEvents.Types.VerifySession,
      payload,
    });
  }

  /**
   * sends mute session
   */
  public sendMuteSession(): void {
    this.send({
      type: ApiEvents.Types.MuteSession,
    });
  }

  /**
   * sends un mute session
   */
  public sendUnMuteSession(): void {
    this.send({
      type: ApiEvents.Types.UnMuteSession,
    });
  }

  /**
   * calls GET /settings
   */
  public async callGetSettings<T = any>(): Promise<T> {
    const { data } = await this.call<any, T>({
      method: "GET",
      path: "settings",
    });

    return data || null;
  }

  private async call<B = any, D = any>(req: ApiCalls.IRequest<B>): Promise<ApiCalls.IResponse<D>> {
    this.verifyOptions();

    const { method, path, data } = req;

    const res = await fetch(`${this.httpEndpoint}/${path}`, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      ...(
        method !== "GET" &&
        method !== "HEAD"
          ? { body: JSON.stringify(data || {}, jsonReplacer) }
          : {}
      ),
    });

    const result: ApiCalls.IResponse<D> = {};

    const text = await res.text();

    switch (res.status) {
      case 400:
        break;

      case 200:
        result.data = JSON.parse(text, jsonReviver);
        break;

      default:
        result.error = text as any;
    }

    return result;
  }

  private send<T = any>(event: IApiEvent<T>): void {
    this.verifyOptions();

    this.connection.send(encodeApiEvent(event));
  }

  private verifyOptions(): void {
    if (!this.options) {
      throw errApiUnknownOptions;
    }
  }
}
