import { BehaviorSubject } from "rxjs";

export interface IMember {
  address$: BehaviorSubject<string>;
  address: string;
  restoreFromPrivateKey(privateKey?: Buffer | string): void;
  personalSign(data: Buffer | string): Promise<string>;
}
