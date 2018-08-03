import { BehaviorSubject } from "rxjs";
import { IMember } from "../member";
import { INetwork } from "../network";
import { ApiStatus } from "./constants";

/**
 * Api
 */
export class Api {

  /**
   * status$ subject
   */
  public status$ = new BehaviorSubject(ApiStatus.Disconnected);

  /**
   * constructor
   * @param network
   * @param member
   */
  constructor(private network: INetwork, private member: IMember) {
    //
  }

  /**
   * status getter
   */
  public get status(): ApiStatus {
    return this.status$.getValue();
  }

  /**
   * status setter
   * @param status
   */
  public set status(status: ApiStatus) {
    if (this.status !== status) {
      this.status$.next(status);
    }
  }
}