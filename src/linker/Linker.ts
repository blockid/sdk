import { jsonReplacer, jsonReviver } from "eth-utils";
import { parse, stringify } from "querystring";
import { UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map } from "rxjs/operators";
import { IAppAttributes, internalApp } from "../app";
import { LinkerActionsTypes, LinkerTargetTypes } from "./constants";
import { ILinker, ILinkerAction, ILinkerOptions, ILinkerTarget } from "./interfaces";

/**
 * Linker
 */
export class Linker implements ILinker {

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
  constructor(options: ILinkerOptions = null) {
    this.options = {
      ...(options || {}),
    };

    this
      .incomingUrl$
      .pipe(
        filter((url) => !!url),
        map((url) => this.decodeActionUrl(url)),
        filter((action) => !!action),
      )
      .subscribe(this.incomingAction$);

    if (this.options.autoAcceptActions) {
      this.incomingAction$.subscribe(this.acceptedAction$);
    }
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
   * @param toApp
   */
  public buildActionUrl<P = any, F = any>(action: ILinkerAction<P, F>, toApp: IAppAttributes = internalApp): string {
    let result: string = null;

    const { app } = this.options;
    let { from } = action;
    const { type, payload } = action;

    if (!from && app) {
      from = {
        type: LinkerTargetTypes.App,
        data: app,
      } as any;
    }

    if (from && toApp && toApp.callbackUrl) {
      const { callbackUrl } = toApp;

      const query = {
        type,
        from: JSON.stringify(from, jsonReplacer),
        payload: JSON.stringify(payload, jsonReplacer),
      };

      result = `${callbackUrl}?${stringify(query)}`;
    }

    return result;
  }

  private decodeActionUrl(url: string): ILinkerAction {
    let result: ILinkerAction;

    try {
      const { callbackUrl } = this.options.app;
      const parts = url.split("?");

      if (
        parts[ 0 ] === callbackUrl &&
        parts.length === 2
      ) {
        const query = parse(parts[ 1 ]);
        const type = query.type as LinkerActionsTypes;
        const from = JSON.parse(query.from as string, jsonReviver) as ILinkerTarget;
        const payload: any = JSON.parse(query.payload as string, jsonReviver);

        result = {
          type,
          from,
          payload,
        };

      }
    } catch (err) {
      result = null;
    }

    return result;
  }

}
