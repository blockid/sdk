import { TUniqueBehaviorSubject, IAbstractAddressHolder } from "../shared";

export interface IKeyPairOptions {
  address?: string;
  publicKey?: Buffer;
  privateKey?: Buffer;
}

export interface IKeyPair extends IAbstractAddressHolder {
  publicKey$: TUniqueBehaviorSubject<Buffer>;
  publicKey: Buffer;
  canSign$: TUniqueBehaviorSubject<boolean>;
  canSign: boolean;
  update(options?: IKeyPairOptions): void;
  signPersonalMessage(message: Buffer | string): Buffer;
}
