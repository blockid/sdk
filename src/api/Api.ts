import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import { IDevice } from "../device";
import {
  jsonReplacer,
  jsonReviver,
  UniqueBehaviorSubject,
} from "../shared";
import {
  decodeWsMessage,
  encodeWsMessage,
  IWsMessage,
  WsMessagePayloads,
  WsMessageTypes,
} from "../ws";
import { ApiConnection } from "./ApiConnection";
import { ApiStates } from "./constants";
import { errApiInvalidState, errApiUnknownOptions } from "./errors";
import { IApi, IApiOptions, IApiConnection, IApiRequest } from "./interfaces";
import { ApiResponses } from "./namespaces";

/**
 * Api
 */
export class Api implements IApi {

  /**
   * options subject
   */
  public options$ = new UniqueBehaviorSubject<IApiOptions>();

  /**
   * sate subject
   */
  public state$ = new UniqueBehaviorSubject<ApiStates>(ApiStates.Disconnected);

  /**
   * ws message subject
   */
  public wsMessage$ = new Subject<IWsMessage>();

  private sessionHash: Buffer = null;

  private reconnectInterval: any = null;

  /**
   * constructor
   * @param device
   * @param options
   * @param connection
   */
  constructor(private device: IDevice, options: IApiOptions = null, private connection: IApiConnection = new ApiConnection()) {
    this.options = options;

    this
      .options$
      .subscribe((options) => {
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
        }

        if (!options) {
          this.connection.disconnect();
          return;
        }

        const { reconnectTimeout } = options;
        const connect = () => {
          this.connection.connect(this.getEndpoint("ws"));
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
        tap(() => {
          this.sessionHash = null;
        }),
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
        map(decodeWsMessage),
      )
      .subscribe(this.wsMessage$);

    this
      .wsMessage$
      .pipe(
        map(({ type, payload }) => {
          let result: ApiStates = null;
          switch (type) {
            case WsMessageTypes.SessionCreated:
              const { hash } = payload as WsMessagePayloads.ISession;
              this.sessionHash = hash;
              result = ApiStates.Connected;
              break;

            case WsMessageTypes.SessionVerified:
              result = ApiStates.Verified;
              break;
          }
          return result;
        }),
        filter((value) => !!value),
      )
      .subscribe(this.state$);
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
      }, ApiStates.Connected);
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
   * GET /identity/:identityAddressOrEnsNameHash
   * @para identityAddressOrEnsNameHash
   */
  public getIdentity(identityAddressOrEnsNameHash: string): Promise<ApiResponses.IIdentity> {
    return this.call({
      path: `identity/${identityAddressOrEnsNameHash}`,
    });
  }

  /**
   * GET /member/:identityAddress
   * @para identityAddress
   */
  public getMembers(identityAddress: string): Promise<ApiResponses.IMember[]> {
    return this.call({
      path: `member/${identityAddress}`,
    });
  }

  /**
   * GET /member/:identityAddress/:memberAddress
   * @para identityAddress
   * @para memberAddress
   */
  public getMember(identityAddress: string, memberAddress: string): Promise<ApiResponses.IMember> {
    return this.call({
      path: `member/${identityAddress}/${memberAddress}`,
    });
  }

  private getEndpoint(protocol: "ws" | "http"): string {
    const { host, port, ssl } = this.options;
    return `${protocol}${ssl ? "s" : ""}://${host || "localhost"}${port ? `:${port}` : ""}`;
  }

  private send<T = any>(message: IWsMessage<T>, requiredState = ApiStates.Verified): void {
    if (this.state !== requiredState) {
      throw errApiInvalidState;
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

  /**
   * verifies options
   */
  private verifyOptions(): void {
    if (!this.options) {
      throw errApiUnknownOptions;
    }
  }
}
