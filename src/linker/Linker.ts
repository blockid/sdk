import { UniqueBehaviorSubject } from "../shared";
import { ILinker, ILinkerOptions } from "./interfaces";

/**
 * Linker
 */
export class Linker implements ILinker {

  /**
   * url subject
   */
  public url$ = new UniqueBehaviorSubject<string>();

  /**
   * constructor
   * @param options
   */
  constructor(private options: ILinkerOptions = {}) {

  }

  /**
   * url getter
   */
  public get url(): string {
    return this.url$.value;
  }

  /**
   * url setter
   * @param url
   */
  public set url(url: string) {
    this.url$.next(url);
  }
}
