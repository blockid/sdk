import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import {
  UniqueBehaviorSubject,
  AttributesProxySubject,
} from "rxjs-addons";
import { jsonReplacer, jsonReviver } from "../json";
import { ApiConnection, IApiConnection } from "./connection";
import { IApiEvent, decodeApiEvent, encodeApiEvent } from "./events";
import { ApiCalls } from "./calls";
import { ApiStates } from "./constants";
import { errApiInvalidState, errApiUnknownOptions } from "./errors";
import { IApi, IApiOptions, IApiAttributes } from "./interfaces";

/**
 * Api
 */
export class Api extends AttributesProxySubject<IApiAttributes> implements IApi {
  private static defaultAttributes: IApiAttributes = {
    state: ApiStates.Disconnected,
  };

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
   * sate subject
   */
  public state$ = new UniqueBehaviorSubject<ApiStates>(ApiStates.Disconnected);

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
    super(Api.defaultAttributes, {
      schema: {
        state: true,
      },
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
              switch (this.state) {
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
            case false:
              result = ApiStates.Disconnected;
              break;
          }
          return result;
        }),
        filter((value) => !!value),
      )
      .subscribe(this.state$);

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
   * state getter
   */
  public get state(): ApiStates {
    return this.state$.value;
  }

  /**
   * state setter
   * @param state
   */
  public set state(state: ApiStates) {
    this.state$.next(state);
  }

  private emit<T = any>(event: IApiEvent<T>, requiredState = ApiStates.Verified): void {
    if (this.state !== requiredState) {
      throw errApiInvalidState;
    }

    this.connection.send(encodeApiEvent(event));
  }

  private async call<ReqD = any, ResD = any>(req: ApiCalls.IRequest<ReqD>): Promise<ApiCalls.IResponse<ResD>> {
    this.verifyOptions();

    const { path, data } = req;
    let { method } = req;

    method = method || "GET";

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

    const result: ApiCalls.IResponse<ResD> = {
      status: res.status,
    };

    const text = await res.text();

    switch (res.status) {
      case 404:
        break;
      case 400:
        break;

      case 200:
        result.data = JSON.parse(text, jsonReviver);
        break;

      default:
        throw new Error(text);
    }

    return result;
  }

  private verifyOptions(): void {
    if (!this.options) {
      throw errApiUnknownOptions;
    }
  }
}
