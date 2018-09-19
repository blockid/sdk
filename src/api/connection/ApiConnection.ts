import { Subject } from "rxjs";
import { UniqueBehaviorSubject } from "rxjs-addons";
import { IApiConnection } from "./interfaces";

/**
 * Api connection
 */
export class ApiConnection implements IApiConnection {

  /**
   * connected subject
   */
  public connected$ = new UniqueBehaviorSubject<boolean>(false);

  /**
   * error subject
   */
  public error$ = new Subject<any>();

  /**
   * data subject
   */
  public data$ = new Subject<Buffer>();

  private ws: WebSocket = null;

  /**
   * constructor
   */
  constructor() {

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
   */
  public connect(endpoint: string = null): void {
    if (typeof WebSocket !== "undefined") {

      this.disconnect(false);

      if (endpoint) {
        this.connected = null;

        this.ws = new WebSocket(endpoint);
        this.ws.binaryType = "arraybuffer";

        this.addOpeningHandlers();
        return;
      }
    }

    this.connected = false;
  }

  /**
   * disconnects
   * @param emit
   */
  public disconnect(emit: boolean = true): void {
    switch (this.connected) {
      case true:
        this.removeOpenedHandlers();
        this.ws.close();
        break;

      case null:
        this.removeOpeningHandlers();
        this.ws.close();
        break;
    }

    if (emit) {
      this.connected = false;
    }
  }

  /**
   * sends
   * @param data
   */
  public send(data: Buffer): void {
    if (this.connected) {
      this.ws.send(data);
    }
  }

  private get connected(): boolean {
    return this.connected$.value;
  }

  private set connected(connected: boolean) {
    this.connected$.next(connected);
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
    this.connected = true;
    this.removeOpeningHandlers();
    this.addOpenedHandlers();
  }

  private openErrorHandler(): void {
    this.connected = false;
    this.removeOpeningHandlers();
    this.ws.close();
  }

  private closeHandler(): void {
    this.removeOpenedHandlers();
    this.connected = false;
  }

  private errorHandler(event: WebSocketEventMap["error"]): void {
    this.error$.next(event);
    this.ws.close();
  }

  private messageHandler({ data }: WebSocketEventMap["message"]): void {
    this.data$.next(Buffer.from(data));
  }
}
