import { jsonReplacer, jsonReviver } from "eth-utils";
import { parse, stringify } from "querystring";
import { UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map } from "rxjs/operators";
import { IAppAttributes, internalApp } from "../app";
import { IDevice } from "../device";
import { LinkerActionsTypes, LinkerActionSenderTypes } from "./constants";
import { ILinker, ILinkerAction, ILinkerOptions, ILinkerActionSender } from "./interfaces";

/**
 * Linker
 */
export class Linker implements ILinker {

  /**
   * incoming url subject
   */
  public incomingUrl$ = new UniqueBehaviorSubject<string>();

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
   * @param device
   * @param options
   */
  constructor(private device: IDevice, options: ILinkerOptions = null) {
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

    const { type, payload } = action;

    if (toApp && toApp.callbackUrl) {
      const sender: ILinkerActionSender = app
        ? {
          type: LinkerActionSenderTypes.App,
          data: app,
        }
        : {
          type: LinkerActionSenderTypes.Device,
          data: this.device.address,
        };

      const query = {
        type,
        sender: JSON.stringify(sender, jsonReplacer),
        payload: JSON.stringify(payload, jsonReplacer),
      };

      result = `${toApp.callbackUrl}?${stringify(query)}`;
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
        const sender = JSON.parse(query.sender as string, jsonReviver) as ILinkerActionSender;
        const payload: any = JSON.parse(query.payload as string, jsonReviver);

        result = {
          type,
          sender,
          payload,
        };

      }
    } catch (err) {
      result = null;
    }

    return result;
  }

}
