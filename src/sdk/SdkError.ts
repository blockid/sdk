import { Subject } from "rxjs";
import { ISdkError } from "./interfaces";

/**
 * Sdk Error
 */
export class SdkError extends Subject<any> implements ISdkError {

  /**
   * wraps async
   * @param promise
   */
  public wrapAsync(promise: Promise<any>): void {
    promise
      .catch((err) => {
        this.next(err);
      });
  }

  /**
   * wraps T async
   * @param promise
   */
  public wrapTAsync<T = any>(promise: Promise<T>): Promise<T> {
    return promise
      .catch((err) => {
        this.next(err);
        return null;
      });
  }
}
