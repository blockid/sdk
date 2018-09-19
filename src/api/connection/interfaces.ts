import { Subject } from "rxjs";
import { TUniqueBehaviorSubject } from "rxjs-addons";

export interface IApiConnection {
  connected$: TUniqueBehaviorSubject<boolean>;
  error$: Subject<any>;
  data$: Subject<Buffer>;
  connect(endpoint: string): void;
  disconnect(emit?: boolean): void;
  send(data: Buffer): void;
}
