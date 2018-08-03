export interface IConfig {
  network: {
    endpoints: {
      [ key: string ]: string;
    };
  };
}

export interface IStorage<T = any> {
  get(...path: string[]): T | Promise<T>;
  set(item: T, ...path: string[]): void | Promise<void>;
}
