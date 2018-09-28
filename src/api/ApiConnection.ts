import { Subject } from "rxjs";
import { AttributesProxySubject, ErrorSubject, TAttributesSchema } from "rxjs-addons";
import { ApiConnectionStates } from "./constants";
import { IApiConnection, IApiConnectionAttributes } from "./interfaces";

const attributesSchema: TAttributesSchema<IApiConnectionAttributes> = {
  state: {
    getter: true,
  },
  muted: true,
};

/**
 * Api connection
 */
export class ApiConnection extends AttributesProxySubject<IApiConnectionAttributes> implements IApiConnection {

  /**
   * prepares attributes
   * @param attributes
   */
  public static prepareAttributes(attributes: IApiConnectionAttributes = null): IApiConnectionAttributes {
    let result: IApiConnectionAttributes = {
      state: ApiConnectionStates.Closed,
      muted: true,
    };

    if (attributes) {
      result = {
        ...result,
        ...attributes,
      };
    }

    return result;
  }

  /**
   * data subject
   */
  public data$ = new Subject<Buffer>();

  /**
   * error subject
   */
  public error$ = new ErrorSubject();

  private ws: WebSocket = null;

  /**
   * constructor
   */
  constructor() {
    super(null, {
      schema: attributesSchema,
      prepare: ApiConnection.prepareAttributes,
    });

    // binds handlers to this
    this.openHandler = this.openHandler.bind(this);
    this.openErrorHandler = this.openErrorHandler.bind(this);
    this.closeHandler = this.closeHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.messageHandler = this.messageHandler.bind(this);
  }

  /**
   * opened getter
   */
  public get opened(): boolean {
    return this.getAttribute("state") === ApiConnectionStates.Opened;
  }

  /**
   * opens
   * @param endpoint
   * @param protocol
   */
  public open(endpoint: string, protocol: string): void {
    this.setAttribute("muted", true);

    if (typeof WebSocket !== "undefined") {

      this.close(false);

      if (endpoint) {
        this.setAttribute("state", ApiConnectionStates.Opening);

        this.ws = new WebSocket(endpoint, protocol);
        this.ws.binaryType = "arraybuffer";

        this.addOpeningHandlers();
        return;
      }
    }

    this.setAttribute("state", ApiConnectionStates.Closed);
  }

  /**
   * disconnects
   * @param emitState
   */
  public close(emitState: boolean = true): void {
    switch (this.getAttribute("state")) {
      case ApiConnectionStates.Opened:
        this.removeOpenedHandlers();
        this.ws.close();
        break;

      case ApiConnectionStates.Opening:
        this.removeOpeningHandlers();
        this.ws.close();
        break;

      case ApiConnectionStates.Closed:
        return;
    }

    if (emitState) {
      this.attributes = null;
    }
  }

  /**
   * sends
   * @param data
   */
  public send(data: Buffer): void {
    if (data) {
      this.ws.send(data);
    }
  }

  private addOpeningHandlers(): void {
    this.ws.addEventListener("open", this.openHandler);
    this.ws.addEventListener("close", this.openErrorHandler);
    this.ws.addEventListener("error", this.openErrorHandler);
  }

  private removeOpeningHandlers(): void {
    this.ws.removeEventListener("open", this.openHandler);
    this.ws.removeEventListener("close", this.openErrorHandler);
    this.ws.removeEventListener("error", this.openErrorHandler);
  }

  private addOpenedHandlers(): void {
    this.ws.addEventListener("close", this.closeHandler);
    this.ws.addEventListener("error", this.errorHandler);
    this.ws.addEventListener("message", this.messageHandler);
  }

  private removeOpenedHandlers(): void {
    this.ws.addEventListener("close", this.closeHandler);
    this.ws.addEventListener("error", this.errorHandler);
    this.ws.addEventListener("message", this.messageHandler);
  }

  private openHandler(): void {
    this.setAttribute("state", ApiConnectionStates.Opened);
    this.removeOpeningHandlers();
    this.addOpenedHandlers();
  }

  private openErrorHandler(): void {
    this.setAttribute("state", ApiConnectionStates.Closed);
    this.removeOpeningHandlers();
    this.ws.close();
  }

  private closeHandler(): void {
    this.removeOpenedHandlers();
    this.setAttribute("state", ApiConnectionStates.Closed);
  }

  private errorHandler(event: WebSocketEventMap["error"]): void {
    this.error$.next(event);
    this.ws.close();
  }

  private messageHandler({ data }: WebSocketEventMap["message"]): void {
    this.data$.next(Buffer.from(data));
  }
}
