import "cross-fetch/polyfill";

import { BehaviorSubject } from "rxjs";
import { IMember } from "../member";
import { jsonReplacer, jsonReviver } from "../utils";
import { errApiUndefinedOptions } from "../errors";
import { ApiStatus } from "./constants";
import {
  IApi,
  IApiOptions,
  IApiRequest,
  IApiResponseSettings,
} from "./interfaces";

/**
 * Api
 */
export class Api implements IApi {

  /**
   * status$ subject
   */
  public status$ = new BehaviorSubject(ApiStatus.Disconnected);

  private options: IApiOptions = null;

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
      this.setStatus(ApiStatus.Disconnected);
      this.options = options || null;
    }
  }

  /**
   * gets settings
   */
  public getSettings(): Promise<IApiResponseSettings> {
    return this.call<IApiResponseSettings>({
      path: "settings",
    });
  }

  private buildEndpoint(protocol: "http" | "ws"): string {
    const { host, port, ssl } = this.options;
    return `${protocol}${ssl ? "s" : ""}://${host || "localhost"}${port ? `:${port}` : ""}`;
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
