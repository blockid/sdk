import { jsonReviver, jsonReplacer } from "../shared";
import { STORAGE_KEY_SEPARATOR } from "./constants";
import { errStorageUnknownAdapter } from "./errors";
import { IStorage, IStorageOptions } from "./interfaces";

/**
 * Storage
 */
export class Storage implements IStorage {

  /**
   * constructor
   * @param options
   */
  constructor(private options: IStorageOptions) {
    //
  }

  /**
   * gets doc
   * @param key
   */
  public async getDoc<T = any>(key: string): Promise<T> {
    this.verifyAdapter();

    let result: any = null;

    key = this.prepareKey(key);

    try {
      const item = await this.options.adapter.getItem(key);
      if (item) {
        result = JSON.parse(item, jsonReviver) || null;
      }
    } catch (err) {
      result = null;
    }

    return result;
  }

  /**
   * sets doc
   * @param key
   * @param item
   */
  public async setDoc<T = any>(key: string, item: T = null): Promise<void> {
    this.verifyAdapter();

    key = this.prepareKey(key);

    if (item) {
      const doc = JSON.stringify(item, jsonReplacer);
      await this.options.adapter.setItem(key, doc);
    } else {
      await this.options.adapter.removeItem(key);
    }
  }

  /**
   * removes doc
   * @param key
   */
  public removeDoc(key: string): Promise<void> {
    return this.setDoc(key, null);
  }

  private prepareKey(...parts: string[]): string {
    if (this.options.namespace) {
      parts = [
        this.options.namespace,
        ...parts,
      ];
    }

    return parts.join(STORAGE_KEY_SEPARATOR);
  }

  private verifyAdapter(): void {
    if (!this.options.adapter) {
      throw errStorageUnknownAdapter;
    }
  }
}
