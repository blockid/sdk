import { Subject, from } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { jsonReviver, jsonReplacer, ErrorSubject } from "../shared";
import { STORAGE_KEY_SEPARATOR } from "./constants";
import { errStorageUnknownAdapter } from "./errors";
import { IStorage, IStorageOptions } from "./interfaces";

/**
 * Storage
 */
export class Storage implements IStorage {

  /**
   * error subject
   */
  public error$ = new ErrorSubject();

  private cacheWriteKey$ = new Subject<string>();
  private cacheData = new Map<string, string>();

  /**
   * constructor
   * @param options
   */
  constructor(private options: IStorageOptions) {
    this
      .cacheWriteKey$
      .pipe(
        mergeMap((key) => from(this
          .error$
          .wrapTAsync(async () => {
            const item = this.cacheData.get(key) || null;
            if (item) {
              await options.adapter.setItem(key, item);
            } else {
              await options.adapter.removeItem(key);
            }
          })),
        ),
      )
      .subscribe();
  }

  /**
   * gets doc
   * @param key
   */
  public async getDoc<T = any>(key: string): Promise<T> {
    this.verifyAdapter();

    let result: any = null;

    key = this.prepareKey(key);

    let item: string = null;

    try {
      item = (await this.options.adapter.getItem(key)) || null;
      if (item) {
        result = JSON.parse(item, jsonReviver) || null;
      }
    } catch (err) {
      this.error$.next(err);

      result = null;
      item = null;
    }

    this.cacheData.set(key, item);

    return result;
  }

  /**
   * sets doc
   * @param key
   * @param doc
   */
  public setDoc<T = any>(key: string, doc: T = null): void {
    this.verifyAdapter();

    key = this.prepareKey(key);

    let item: string = null;

    if (doc) {
      item = JSON.stringify(doc, jsonReplacer);
    }

    if (item !== (this.cacheData.get(key) || null)) {
      this.cacheData.set(key, item);
      this.cacheWriteKey$.next(key);
    }
  }

  /**
   * removes doc
   * @param key
   */
  public removeDoc(key: string): void {
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
