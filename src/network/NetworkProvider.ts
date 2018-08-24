import "cross-fetch/polyfill";

import { UniqueBehaviorSubject } from "../shared";
import {
  errNetworkUnknownProvideEndpoint,
  errNetworkUnsupportedProviderMethod,
} from "./errors";
import { INetworkProvider } from "./interfaces";

/**
 * Network provider
 */
export class NetworkProvider implements INetworkProvider {

  /**
   * endpoint$ subject
   */
  public endpoint$ = new UniqueBehaviorSubject<string>();

  /**
   * constructor
   * @param endpoint
   */
  constructor(endpoint: string = null) {
    this.endpoint = endpoint;
  }

  /**
   * endpoint getter
   */
  public get endpoint(): string {
    return this.endpoint$.value;
  }

  /**
   * endpoint setter
   * @param endpoint
   */
  public set endpoint(endpoint: string) {
    this.endpoint$.next(endpoint || null);
  }

  /**
   * sends
   * @param payload
   */
  public send(payload: any): void {
    throw errNetworkUnsupportedProviderMethod;
  }

  /**
   * sends async
   * @param payload
   * @param callback
   */
  public sendAsync(payload: any, callback: (err: any, data: any) => void): void {
    if (!this.endpoint) {
      callback(errNetworkUnknownProvideEndpoint, null);
      return;
    }

    fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        callback(null, data);
      })
      .catch((err) => {
        callback(err, null);
      });
  }

  /**
   * is connected
   */
  public isConnected(): boolean {
    return !!this.endpoint;
  }
}
