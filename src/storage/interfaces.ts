import { IErrorSubject } from "rxjs-addons";

export interface IStorage {
  error$: IErrorSubject;
  getDoc<T = any>(key: string): Promise<T>;
  setDoc<T = any>(key: string, doc?: T): void;
  removeDoc(key: string): void;
}

export interface IStorageOptions {
  namespace?: string;
  adapter: IStorageAdapter;
}

export interface IStorageAdapter {
  getItem(key: string): Promise<string>;
  setItem(key: string, item: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
