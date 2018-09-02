import { parse, stringify } from "querystring";
import { filter, map } from "rxjs/operators";
import { jsonReplacer, jsonReviver, UniqueBehaviorSubject } from "../shared";
import { LinkerActionsTypes, LinkerTargetTypes } from "./constants";
import { ILinker, ILinkerAction, ILinkerApp, ILinkerOptions, ILinkerTarget } from "./interfaces";

const UNKNOWN_APP: ILinkerApp = {
  name: "",
  callbackUrl: "",
};

/**
 * Linker
 */
export class Linker implements ILinker {

  private static parseUrl(url: string): ILinkerAction {
    let result: ILinkerAction;

    try {
      let parts = url.split("://");
      if (parts.length === 2) {
        const app: ILinkerApp = {
          name: parts[ 0 ],
        };

        parts = parts[ 1 ].split("?");

        app.callbackUrl = parts[ 0 ];

        const query = parse(parts[ 1 ]);
        const type = query.type as LinkerActionsTypes;
        const from = JSON.parse(query.from as string, jsonReviver) as ILinkerTarget;
        const payload: any = JSON.parse(query.payload as string, jsonReviver);

        result = {
          type,
          to: {
            type: LinkerTargetTypes.App,
            data: app,
          },
          from,
          payload,
        };

      }
    } catch (err) {
      result = null;
    }

    return result;
  }

  /**
   * incoming url subject
   */
  public incomingUrl$ = new UniqueBehaviorSubject<string>();

  /**
   * outgoing url subject
   */
  public outgoingUrl$ = new UniqueBehaviorSubject<string>();

  /**
   * incoming action subject
   */
  public incomingAction$ = new UniqueBehaviorSubject<ILinkerAction>();

  /**
   * accepted action subject
   */
  public acceptedAction$ = new UniqueBehaviorSubject<ILinkerAction>();

  private readonly options: ILinkerOptions;

  /**
   * constructor
   * @param options
   */
  constructor(options: ILinkerOptions = {}) {
    this.options = {
      app: UNKNOWN_APP,
      ...(options || {}),
    };

    this.options.app = {
      ...UNKNOWN_APP,
      ...this.options.app,
    };

    this
      .incomingUrl$
      .pipe(
        filter((url) => !!url),
        map(Linker.parseUrl),
      )
      .subscribe(this.incomingAction$);
  }

  /**
   * accepts action
   * @param action
   */
  public acceptAction(action: ILinkerAction): void {
    this.incomingAction$.next(null);
    this.acceptedAction$.next(action);
  }

  /**
   * rejects action
   */
  public rejectAction(): void {
    this.incomingAction$.next(null);
  }

  /**
   * builds action url
   * @param action
   */
  public buildActionUrl<F = any, P = any>(action: ILinkerAction<ILinkerApp, F, P>): string {
    let result: string = null;

    const { app } = this.options;
    let { to, from } = action;
    const { type, payload } = action;

    if (!to) {
      to = {
        type: LinkerTargetTypes.App,
        data: UNKNOWN_APP,
      } as ILinkerTarget;
    }

    if (!from) {
      from = {
        type: LinkerTargetTypes.App,
        data: app,
      } as ILinkerTarget;
    }

    if (to.type === LinkerTargetTypes.App) {
      const { name, callbackUrl } = to.data as ILinkerApp;

      const query = {
        type,
        from: JSON.stringify(from, jsonReplacer),
        payload: JSON.stringify(payload, jsonReplacer),
      };

      result = `${name}://${callbackUrl}?${stringify(query)}`;
    }

    return result;
  }
}
