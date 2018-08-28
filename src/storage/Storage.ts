import { jsonReviver, jsonReplacer } from "../shared";
import { StorageKeys, STORAGE_KEY_SEPARATOR } from "./constants";
import { errStorageUnknownAdapter } from "./errors";
import {
  IStorage,
  IStorageOptions,
  IStorageDeviceDoc,
  IStorageIdentityDoc,
} from "./interfaces";

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
   * gets device doc
   */
  public getDeviceDoc(): Promise<IStorageDeviceDoc> {
    return this.getItem(
      this.buildKey(StorageKeys.Device),
    );
  }

  /**
   * sets device doc
   * @param doc
   */
  public setDeviceDoc(doc: IStorageDeviceDoc = null): Promise<void> {
    return this.setItem(
      this.buildKey(StorageKeys.Device),
      doc,
    );
  }

  /**
   * removes device doc
   */
  public removeDeviceDoc(): Promise<void> {
    return this.setItem(
      this.buildKey(StorageKeys.Device),
    );
  }

  /**
   * gets identity doc
   */
  public getIdentityDoc(): Promise<IStorageIdentityDoc> {
    return this.getItem(
      this.buildKey(StorageKeys.Identity),
    );
  }

  /**
   * sets identity doc
   * @param doc
   */
  public setIdentityDoc(doc: IStorageIdentityDoc): Promise<void> {
    return this.setItem(
      this.buildKey(StorageKeys.Identity),
      doc,
    );
  }

  /**
   * removes identity doc
   */
  public removeIdentityDoc(): Promise<void> {
    return this.setItem(
      this.buildKey(StorageKeys.Identity),
    );
  }

  private buildKey(...parts: string[]): string {
    if (this.options && this.options.namespace) {
      parts = [
        this.options.namespace,
        ...parts,
      ];
    }

    return parts.join(STORAGE_KEY_SEPARATOR);
  }

  private async getItem(key: string): Promise<any> {
    this.verifyAdapter();

    let result: any = null;

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

  private async setItem(key: string, item: any = null) {
    this.verifyAdapter();

    if (item) {
      const doc = JSON.stringify(item, jsonReplacer);
      await this.options.adapter.setItem(key, doc);
    } else {
      await this.options.adapter.removeItem(key);
    }
  }

  private verifyAdapter(): void {
    if (!this.options.adapter) {
      throw errStorageUnknownAdapter;
    }
  }

}
