export interface IStorage {
  getDoc<T = any>(key: string): Promise<T>;
  setDoc<T = any>(key: string, doc?: T): Promise<void>;
  removeDoc(key: string): Promise<void>;
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
