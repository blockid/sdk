import { jsonReplacer, jsonReviver } from "eth-utils";
import { parse, stringify } from "querystring";
import { UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map } from "rxjs/operators";
import { IAppAttributes, internalApp } from "../app";
import { IDevice } from "../device";
import { LinkerActionSenderTypes, LinkerActionsTypes } from "./constants";
import {
  ILinker,
  ILinkerAction,
  ILinkerActionSender,
  ILinkerActionUrls,
  ILinkerBuildActionUrlOptions,
  ILinkerOptions,
} from "./interfaces";

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
   * app name getter
   */
  public get appName(): string {
    const { app } = this.options;
    return app && app.name ? app.name : null;
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
   * @param options
   */
  public buildActionUrl<P = any, S = any>(action: ILinkerAction<P, S>, options: ILinkerBuildActionUrlOptions = {}): string {
    let result: string = null;

    options = {
      senderType: LinkerActionSenderTypes.Device,
      toApp: internalApp,
      ...options,
    };

    const { app } = this.options;
    const { toApp, senderType } = options;

    const { type, payload } = action;

    let sender: ILinkerActionSender = null;

    switch (senderType) {
      case LinkerActionSenderTypes.App:
        if (app) {
          sender = {
            type: LinkerActionSenderTypes.App,
            data: app,
          };
        }
        break;
      case LinkerActionSenderTypes.Device:
        sender = {
          type: LinkerActionSenderTypes.Device,
          data: this.device.address,
        };
        break;
    }

    if (sender && toApp && toApp.callbackUrl) {
      const query = {
        type,
        sender: JSON.stringify(sender, jsonReplacer),
        payload: JSON.stringify(payload, jsonReplacer),
      };

      result = `${toApp.callbackUrl}?${stringify(query)}`;
    }

    return result;
  }

  /**
   * builds action urls
   * @param action
   * @param toApp
   */
  public buildActionUrls<P = any>(action: ILinkerAction<P, any>, toApp: IAppAttributes = internalApp): ILinkerActionUrls {
    return {
      appUrl: this.buildActionUrl(action, { toApp, senderType: LinkerActionSenderTypes.App }),
      deviceUrl: this.buildActionUrl(action, { toApp, senderType: LinkerActionSenderTypes.Device }),
    };
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
