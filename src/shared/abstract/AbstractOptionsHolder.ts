import { UniqueBehaviorSubject, TUniqueBehaviorSubject } from "../rx";
import { errUnknownOptions } from "./errors";
import { IAbstractOptionsHolder } from "./interfaces";

/**
 * Abstract options holder
 */
export abstract class AbstractOptionsHolder<T> implements IAbstractOptionsHolder<T> {

  /**
   * options subject
   */
  public options$: TUniqueBehaviorSubject<T>;

  /**
   * constructor
   * @param options
   */
  protected constructor(options: T = null) {
    this.options$ = new UniqueBehaviorSubject<T>(
      options,
      (options) => this.prepareOptions(options),
    );
  }

  /**
   * address getter
   */
  public get options(): T {
    return this.options$.value;
  }

  /**
   * address setter
   * @param options
   */
  public set options(options: T) {
    this.options$.next(options);
  }

  /**
   * prepares options
   * @param options
   */
  protected prepareOptions(options: T): T {
    return options;
  }

  /**
   * verifies options
   */
  protected verifyOptions(): void {
    if (!this.options) {
      throw errUnknownOptions;
    }
  }
}
