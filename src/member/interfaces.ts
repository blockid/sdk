import { BehaviorSubject } from "rxjs";

export interface IMember {
  address$: BehaviorSubject<string>;
  getAddress(): string;
  setAddress(address: string): void;
  setPrivateKey(privateKey?: Buffer | string): void;
  personalSign(data: Buffer | string): Promise<string>;
}

export interface IMemberOptions {
  privateKey?: Buffer;
}
