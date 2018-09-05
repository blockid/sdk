import "cross-fetch/polyfill";

import { Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
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

  private reconnectInterval: any = null;

  /**
   * constructor
   * @param options
   * @param connection
   */
  constructor(options: IApiOptions = null, private connection: IApiConnection = new ApiConnection()) {
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
   * @param signature;
   */
  public verifySession(signature: Buffer): void {
    this.send<WsMessagePayloads.ISignedSession>({
      type: WsMessageTypes.VerifySession,
      payload: {
        signature,
      },
    }, ApiStates.Connected);
  }

  /**
   * mutes session
   */
  public muteSession(): void {
    this.send({
      type: WsMessageTypes.MuteSession,
      payload: null,
    }, ApiStates.Verified);
  }

  /**
   * un mutes session
   */
  public unMuteSession(): void {
    this.send({
      type: WsMessageTypes.UnMuteSession,
      payload: null,
    }, ApiStates.Verified);
  }

  /**
   * verifies personal message
   * @param recipient
   * @param signature
   */
  public verifyPersonalMessage(recipient: string, signature: Buffer): void {
    this.send<WsMessagePayloads.ISignedPersonalMessage>({
      type: WsMessageTypes.VerifyPersonalMessage,
      payload: {
        recipient,
        signature,
      },
    }, ApiStates.Verified);
  }

  // http methods

  /**
   * GET /settings
   */
  public getSettings(): Promise<ApiResponses.ISettings> {
    return this
      .call({
        path: "settings",
      })
      .catch(() => null);
  }

  /**
   * GET /identity/:identity
   * @para identity
   */
  public getIdentity(identity: string): Promise<ApiResponses.IIdentity> {
    return this
      .call({
        path: `identity/${identity}`,
      });
  }

  /**
   * GET /identity/:identity/member
   * @para identity
   */
  public getIdentityMembers(identity: string): Promise<ApiResponses.IIdentityMember[]> {
    return this
      .call({
        path: `identity/${identity}/member`,
      });
  }

  /**
   * POST /identity/:identity/:method
   * @para identity
   * @para method
   * @para data
   */
  public callIdentityMethod(identity: string, method: string, body: any): Promise<ApiResponses.IIdentityMethodCall> {
    return this
      .call({
        path: `identity/${identity}/${method}`,
        method: "POST",
        body,
      });
  }

  /**
   * GET /identity/:identity/member/:member
   * @para identityAddress
   * @para memberAddress
   */
  public getIdentityMember(identity: string, member: string): Promise<ApiResponses.IIdentityMember> {
    return this
      .call({
        path: `identity/${identity}/member/${member}`,
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

    const { path, body } = req;
    let { method } = req;

    method = method || "GET";

    let result: T = null;

    const res = await fetch(`${endpoint}/${path}`, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      ...(
        method !== "GET" &&
        method !== "HEAD"
          ? { body: JSON.stringify(body || {}, jsonReplacer) }
          : {}
      ),
    });

    const text = await res.text();

    switch (res.status) {
      case 404:
        result = null;
        break;

      case 200:
      case 400:
        result = JSON.parse(text, jsonReviver);
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
