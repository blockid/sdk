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
    return this.getItem(StorageKeys.Device);
  }

  /**
   * sets device doc
   * @param doc
   */
  public setDeviceDoc(doc: IStorageDeviceDoc = null): Promise<void> {
    return this.setItem(StorageKeys.Device, doc);
  }

  /**
   * removes device doc
   */
  public removeDeviceDoc(): Promise<void> {
    return this.setItem(StorageKeys.Device, null);
  }

  /**
   * gets identity doc
   * @param path
   */
  public getIdentityDoc(...path: string[]): Promise<IStorageIdentityDoc> {
    return this.getItem([
      StorageKeys.Identity,
      ...path,
    ].join(STORAGE_KEY_SEPARATOR));
  }

  /**
   * sets identity doc
   * @param doc
   * @param path
   */
  public setIdentityDoc(doc: IStorageIdentityDoc, ...path: string[]): Promise<void> {
    return this.setItem([
      StorageKeys.Identity,
      ...path,
    ].join(STORAGE_KEY_SEPARATOR), doc);
  }

  /**
   * removes identity doc
   * @param path
   */
  public removeIdentityDoc(...path: string[]): Promise<void> {
    return this.setItem([
      StorageKeys.Identity,
      ...path,
    ].join(STORAGE_KEY_SEPARATOR), null);
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

  private async setItem(key: string, item: any) {
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
