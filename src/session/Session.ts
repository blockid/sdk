import { ErrorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { filter, map, tap } from "rxjs/operators";
import { ApiEvents, ApiStates, IApi } from "../api";
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
   * muted subject
   */
  public muted$ = new UniqueBehaviorSubject<boolean>(true);

  private hash: Buffer = null;

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

    this
      .api
      .state$
      .pipe(
        filter((state) => state !== ApiStates.Connected),
        tap(() => {
          this.hash = null;
          this.verified$.next(false);
          this.muted$.next(false);
        }),
      )
      .subscribe();

    this
      .api
      .event$
      .pipe(
        filter(({ type }) => type === ApiEvents.Types.SessionCreated),
        map(({ payload }) => payload as ApiEvents.Payloads.ISession),
        tap(({ hash }) => {
          this.hash = hash;

          if (options.autoVerify) {
            this.error$.wrapAsync(() => this.verify());
          }
        }),
      )
      .subscribe();

    this
      .api
      .event$
      .pipe(
        filter(({ type }) => type === ApiEvents.Types.SessionVerified),
        map(() => true),
      )
      .subscribe(this.verified$);

    this
      .api
      .event$
      .pipe(
        filter(({ type }) => (
          type === ApiEvents.Types.SessionMuted ||
          type === ApiEvents.Types.SessionUnMuted
        )),
        map(({ type }) => type === ApiEvents.Types.SessionMuted),
      )
      .subscribe(this.muted$);
  }

  /**
   * verified getter
   */
  public get verified(): boolean {
    return this.verified$.value;
  }

  /**
   * muted getter
   */
  public get muted(): boolean {
    return this.muted$.value;
  }

  /**
   * verifies
   */
  public async verify(): Promise<void> {
    if (this.verified) {
      return;
    }

    if (!this.hash) {
      return;
    }

    const signature = await this.device.signPersonalMessage(this.hash);

    this.api.sendVerifySession({
      signature,
    });
  }

  /**
   * mutes
   */
  public mute(): void {
    if (!this.verified || this.muted) {
      return;
    }

    this.api.sendMuteSession();
  }

  /**
   * un mutes
   */
  public unMute(): void {
    if (!this.verified || !this.muted) {
      return;
    }

    this.api.sendUnMuteSession();
  }
}
