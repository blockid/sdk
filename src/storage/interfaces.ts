import { IEnsNode } from "../ens";

export interface IStorage {
  getDeviceDoc(): Promise<IStorageDeviceDoc>;
  setDeviceDoc(doc: IStorageDeviceDoc): Promise<void>;
  removeDeviceDoc(): Promise<void>;
  getIdentityDoc(...path: string[]): Promise<IStorageIdentityDoc>;
  setIdentityDoc(doc: IStorageIdentityDoc, ...path: string[]): Promise<void>;
  removeIdentityDoc(...path: string[]): Promise<void>;
}

export interface IStorageOptions {
  adapter: IStorageAdapter;
}

export interface IStorageAdapter {
  getItem(key: string): Promise<string>;
  setItem(key: string, item: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface IStorageDeviceDoc {
  privateKey: Buffer;
}

export interface IStorageIdentityDoc {
  address: string;
  ensNode: IEnsNode;
}
