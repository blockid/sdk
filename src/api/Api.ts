import "cross-fetch/polyfill";

import { jsonReplacer, jsonReviver } from "eth-utils";
import { concat } from "rxjs";
import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map } from "rxjs/operators";
import { IDevice } from "../device";
import { ApiConnection } from "./ApiConnection";
import { ApiConnectionStates } from "./constants";
import { errApiUnknownHttpEntpoint, errApiUnknownWsEntpoint } from "./errors";
import { ApiEvents } from "./events";
import { IApi, IApiConnection, IApiOptions, IApiRequest, IApiResponse } from "./interfaces";

/**
 * Api
 */
export class Api implements IApi {

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
   * error subject
   */
  public error$ = new ErrorSubject();

  private endpoints: {
    http: string
    ws: string;
  } = null;

  private sessionToken: string = null;

  private reconnectInterval: any = null;

  /**
   * constructor
   * @param device
   * @param options
   * @param connection
   */
  constructor(private device: IDevice, options: IApiOptions = null, public connection: IApiConnection = new ApiConnection()) {
    this.options = options;

    this
      .options$
      .subscribe((options) => {
        this.endpoints = {
          http: Api.buildEndpoint("http", options),
          ws: Api.buildEndpoint("http", options),
        };
        this.sessionToken = null;
      });

    const { event$ } = this.connection;

    if (event$) {
      event$
        .pipe(
          filter(({ type }) => (
            type === ApiEvents.Types.ConnectionMuted ||
            type === ApiEvents.Types.ConnectionUnMuted
          )),
          map(({ type }) => type === ApiEvents.Types.ConnectionMuted),
        )
        .subscribe(this.connection.muted$);
    }

    // auto auth
    concat(this.options$, this.device.address$)
      .pipe(
        map(() => (
          this.options &&
          !!this.device.address
        )),
      )
      .subscribe((canAuth) => {
        if (canAuth) {
          if (this.options.manualAuth) {
            this.error$.wrapAsync(() => this.auth());
          }
        } else {
          this.disconnect();
        }
      });
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
   * auth
   */
  public async auth(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    if (!this.endpoints.ws) {
      throw errApiUnknownWsEntpoint;
    }

    const { hash } = await this.createSession();
    const signer = this.device.address;
    const signature = this.device.signPersonalMessage(hash);

    const { token } = await this.verifySession({
      hash,
      signer,
      signature,
    });

    this.sessionToken = token;

    const { reconnectTimeout } = this.options;

    const connect = () => {
      this.connection.connect(
        this.endpoints.ws,
        this.sessionToken,
      );
    };

    connect();

    if (reconnectTimeout) {
      this.reconnectInterval = setInterval(
        () => {
          switch (this.connection.state) {
            case ApiConnectionStates.Disconnected:
              connect();
              break;
          }
        },
        reconnectTimeout,
      );
    }
  }

  /**
   * disconnects
   */
  public disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    this.sessionToken = null;
    this.connection.disconnect(true);
  }

  /**
   * mute connection
   */
  public muteConnection(): void {
    this.connection.emit({
      type: ApiEvents.Types.MuteConnection,
    });
  }

  /**
   * un mute connection
   */
  public unMuteConnection(): void {
    this.connection.emit({
      type: ApiEvents.Types.UnMuteConnection,
    });
  }

  /**
   * GET /settings
   */
  public async getSettings<B = any>(): Promise<B> {
    const { data } = await this.call<any, B>({
      method: "GET",
      path: "settings",
    });

    return data || null;
  }

  private async call<B = any, D = any>(req: IApiRequest<B>): Promise<IApiResponse<D>> {
    if (!this.endpoints.http) {
      throw errApiUnknownHttpEntpoint;
    }

    const { method, path, body } = req;

    const res = await fetch(`${this.endpoints.http}/${path}`, {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        "X-Session-Token": this.sessionToken || "",
      }),
      ...(
        method !== "GET" &&
        method !== "HEAD"
          ? { body: JSON.stringify(body || {}, jsonReplacer) }
          : {}
      ),
    });

    const text = await res.text();
    return JSON.parse(text, jsonReviver);
  }

  private async createSession<D = { hash: Buffer }>(): Promise<D> {
    const { data } = await this.call<any, D>({
      method: "POST",
      path: "session",
    });

    return data || null;
  }

  private async verifySession<B = { signer: string, hash: Buffer, signature: Buffer }, D = { token: string }>(body: B): Promise<D> {
    const { data } = await this.call<B, D>({
      method: "PUT",
      path: "session",
      body,
    });

    return data || null;
  }
}
