import { BehaviorSubject } from "rxjs";

export interface IMember {
  address: string;
  address$: BehaviorSubject<string>;
  personalSign(data: Buffer | string): Promise<string>;
}
