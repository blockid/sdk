import { Subject } from "rxjs";
import { TApiConnectionFactory } from "../api";

/**
 * creates api web socket connection factory
 */
export function createApiWebSocketConnectionFactory(): TApiConnectionFactory {
  let result: TApiConnectionFactory = null;

  if (typeof WebSocket !== "undefined") {
    result = (endpoint: string) => {
      const connected$ = new Subject<boolean>();
      const error$ = new Subject<any>();
      const data$ = new Subject<Buffer>();

      let ws: WebSocket = null;

      const onOpen = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("close", onOpenError);
        ws.removeEventListener("error", onOpenError);

        ws.addEventListener("close", onClose);
        ws.addEventListener("error", onError);

        connected$.next(true);
      };

      const onOpenError = () => {
        ws.removeEventListener("open", onOpen);
        ws.removeEventListener("close", onOpenError);
        ws.removeEventListener("error", onOpenError);
        ws.removeEventListener("message", onMessage);

        connected$.next(false);
      };

      const onMessage = ({ data }: WebSocketEventMap["message"]) => {
        data$.next(Buffer.from(data));
      };

      const onClose = () => {
        connected$.next(false);
      };

      const onError = (event: WebSocketEventMap["error"]) => {
        error$.next(event);
      };

      const connect = () => {
        ws = new WebSocket(endpoint);
        ws.binaryType = "arraybuffer";

        connected$.next(null);

        ws.addEventListener("open", onOpen);
        ws.addEventListener("close", onOpenError);
        ws.addEventListener("error", onOpenError);
        ws.addEventListener("message", onMessage);
      };

      const disconnect = () => {
        connected$.unsubscribe();
        error$.unsubscribe();
        data$.unsubscribe();

        if (ws) {
          ws.close(100);
        }
      };

      const send = (data: Buffer) => {
        if (ws) {
          ws.send(data);
        }
      };

      return {
        connected$,
        error$,
        data$,
        connect,
        disconnect,
        send,
      };
    };
  }

  return result;
}
