import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { IApi } from "../api";
import { IDevice } from "../device";
import { ISession, ISessionOptions } from "./interfaces";

/**
 * Session
 */
export class Session implements ISession {

  /**
   * error subject
   */
  public error$ = new ErrorSubject();

  /**
   * verified subject
   */
  public verified$ = new UniqueBehaviorSubject<boolean>(false);

  /**
   * constructor
   * @param api
   * @param device
   * @param options
   */
  constructor(
    private api: IApi,
    private device: IDevice,
    options: ISessionOptions = {},
  ) {
    options = {
      autoVerify: true,
      ...options,
    };
  }

  /**
   * verified
   */
  public get verified(): boolean {
    return this.verified$.value;
  }
}
