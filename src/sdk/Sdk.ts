import { Subject, from, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Api } from "../api";
import { Member } from "../member";
import { Network } from "../network";
import { ISdk, ISdkOptions } from "./interfaces";

/**
 * Sdk
 */
export class Sdk {

  /**
   * creates
   * @param options
   */
  public static create(options: ISdkOptions): ISdk {
    const error$ = new Subject<any>();
    const network = new Network();
    const member = new Member(network, options.member || {});
    const api = new Api(member, options.api);

    from(api.getSettings())
      .pipe(tap((settings) => {
        network.setProvider(Network.createProvider(settings.network.providerEndpoint));
        network.setVersion(settings.network.version);
      }))
      .pipe(map(() => null))
      .pipe(catchError((err) => of(err)));

    return {
      error$,
      api,
      member,
      network,
    };
  }
}
