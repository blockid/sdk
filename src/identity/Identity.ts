import { BehaviorSubject, from } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { IStorage } from "../interfaces";
import { IMember } from "../member";
import { INetwork } from "../network";
import { IdentityStatus } from "./constants";
import { IIdentityState } from "./interfaces";

/**
 * Identity
 */
export class Identity {

  /**
   * status$ subject
   */
  public readonly status$ = new BehaviorSubject<IdentityStatus>(IdentityStatus.Initializing);

  /**
   * state$ subject
   */
  public readonly state$ = new BehaviorSubject<IIdentityState>(null);

  /**
   * constructor
   * @param network
   * @param member
   * @param storage
   */
  constructor(private network: INetwork, private member: IMember, private storage: IStorage<IIdentityState> = null) {
    from([
      network.version$,
      member.address$,
    ])
      .pipe(mergeMap((subject) => {
        return subject;
      }))
      .subscribe(this.initializingSubscription.bind(this));
  }

  /**
   * status getter
   */
  public get status(): IdentityStatus {
    return this.status$.getValue();
  }

  /**
   * status setter
   * @param status
   */
  public set status(status: IdentityStatus) {
    if (this.status !== status) {
      this.status$.next(status);
    }
  }

  /**
   * state getter
   */
  public get state(): IIdentityState {
    return this.state$.getValue();
  }

  /**
   * state setter
   * @param state
   */
  public set state(state: IIdentityState) {
    if (this.state !== state) {
      this.state$.next(state);
    }
  }

  /**
   * restores state
   */
  public async restoreState(): Promise<boolean> {
    if (!this.storage) {
      throw new Error("Undefined storage");
    }

    this.state = await Promise.resolve(this.storage.get(
      this.network.version,
      this.member.address,
    ));

    return !!this.state;
  }

  /**
   * stores state
   */
  public async storeState(): Promise<void> {
    if (!this.storage) {
      throw new Error("Undefined storage");
    }

    await Promise.resolve(this.storage.set(
      this.state,
      this.network.version,
      this.member.address,
    ));
  }

  private initializingSubscription(): void {
    if (this.network.version && this.member.address) {
      this.status = IdentityStatus.Initialized;
    } else {
      this.status = IdentityStatus.Initializing;
    }
  }
}
