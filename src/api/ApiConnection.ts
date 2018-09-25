import { Subject } from "rxjs";
import { AttributesProxySubject, ErrorSubject } from "rxjs-addons";
import { ApiConnectionStates } from "./constants";
import { decodeApiEvent, encodeApiEvent, IApiEvent } from "./events";
import { IApiConnection, IApiConnectionAttributes } from "./interfaces";

/**
 * Api connection
 */
export class ApiConnection extends AttributesProxySubject<IApiConnectionAttributes> implements IApiConnection {

  private static prepareAttributes(attributes: IApiConnectionAttributes): IApiConnectionAttributes {
    let result: IApiConnectionAttributes = {
      state: ApiConnectionStates.Disconnected,
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
   * event subject
   */
  public event$ = new Subject<IApiEvent>();

  /**
   * error subject
   */
  public error$ = new ErrorSubject();

  private ws: WebSocket = null;

  /**
   * constructor
   */
  constructor() {
    super({
      state: ApiConnectionStates.Disconnected,
      muted: true,
    }, {
      schema: {
        state: true,
        muted: true,
      },
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
   * connects
   * @param endpoint
   * @param protocol
   */
  public connect(endpoint: string, protocol: string): void {
    this.setAttribute("muted", true);

    if (typeof WebSocket !== "undefined") {

      this.disconnect(false);

      if (endpoint) {
        this.setAttribute("state", ApiConnectionStates.Verifying);

        this.ws = new WebSocket(endpoint, protocol);
        this.ws.binaryType = "arraybuffer";

        this.addOpeningHandlers();
        return;
      }
    }

    this.setAttribute("state", ApiConnectionStates.Disconnected);
  }

  /**
   * disconnects
   * @param emitState
   */
  public disconnect(emitState: boolean = true): void {
    switch (this.getAttribute("state")) {
      case ApiConnectionStates.Verified:
        this.removeOpenedHandlers();
        this.ws.close();
        break;

      case ApiConnectionStates.Verifying:
        this.removeOpeningHandlers();
        this.ws.close();
        break;

      case ApiConnectionStates.Disconnected:
        return;
    }

    if (emitState) {
      this.attributes = null;
    }
  }

  /**
   * emits
   * @param event
   */
  public emit<T>(event: IApiEvent<T>): void {
    if (this.getAttribute("state") === ApiConnectionStates.Verified) {
      const data = encodeApiEvent(event);
      if (data) {
        this.ws.send(data);
      }
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
    this.setAttribute("state", ApiConnectionStates.Verified);
    this.removeOpeningHandlers();
    this.addOpenedHandlers();
  }

  private openErrorHandler(): void {
    this.setAttribute("state", ApiConnectionStates.Disconnected);
    this.removeOpeningHandlers();
    this.ws.close();
  }

  private closeHandler(): void {
    this.removeOpenedHandlers();
    this.setAttribute("state", ApiConnectionStates.Disconnected);
  }

  private errorHandler(event: WebSocketEventMap["error"]): void {
    this.error$.next(event);
    this.ws.close();
  }

  private messageHandler({ data }: WebSocketEventMap["message"]): void {
    const event = decodeApiEvent(Buffer.from(data));
    if (event) {
      this.event$.next(event);
    }
  }
}
