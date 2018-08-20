import { Subject, from } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { Api } from "../api";
import { Member } from "../member";
import { Network } from "../network";
import { createNetworkHttpProvider, createApiWebSocketConnectionFactory } from "../utils";
import { ISdk, ISdkOptions } from "./interfaces";

/**
 * Sdk
 */
export class Sdk implements ISdk {

  public error$ = new Subject<any>();
  public network = new Network();
  public member = new Member(this.network);
  public api = new Api(this.member);

  /**
   * constructor
   * @param options
   */
  constructor(options: ISdkOptions) {
    this.api.setOptions({
      ...options.api,
      connectionFactory: createApiWebSocketConnectionFactory(),
    });

    from(this.api.getSettings().catch(() => null))
      .pipe(
        filter((value) => !!value),
        tap((settings) => {
          {
            const { providerEndpoint, version } = settings.network;
            this.network.setProvider(createNetworkHttpProvider(providerEndpoint));
            this.network.version = version;
          }
        }),
      )
      .subscribe();
  }
}
