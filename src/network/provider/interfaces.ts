import { IProvider } from "ethjs";
import { TUniqueBehaviorSubject } from "rxjs-addons";

export interface INetworkProvider extends IProvider {
  endpoint$: TUniqueBehaviorSubject<string>;
  endpoint: string;
}
