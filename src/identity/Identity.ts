import { filter, map } from "rxjs/operators";
import { IApi } from "../api";
import { IDevice } from "../device";
import { IEnsNode } from "../ens";
import { AbstractAddressHolder, UniqueBehaviorSubject } from "../shared";
import { WsMessageTypes, WsMessagePayloads } from "../ws";
import { IdentityStates } from "./constants";
import { IIdentity } from "./interfaces";

/**
 * Identity
 */
export class Identity extends AbstractAddressHolder implements IIdentity {

  /**
   * state subject
   */
  public state$ = new UniqueBehaviorSubject<IdentityStates>();

  /**
   * ens node subject
   */
  public ensNode$ = new UniqueBehaviorSubject<IEnsNode>();

  /**
   * constructor
   * @param api
   * @param device
   */
  constructor(private api: IApi, private device: IDevice) {
    super();

    api
      .options$
      .pipe(map(() => null))
      .subscribe(this.address$);

    api
      .options$
      .pipe(map(() => null))
      .subscribe(this.state$);

    api
      .options$
      .pipe(map(() => null))
      .subscribe(this.ensNode$);

    api
      .wsMessage$
      .pipe(
        filter(({ type }) => type === WsMessageTypes.IdentityCreated),
        map(({ type, payload }) => payload as WsMessagePayloads.IIdentity),
        filter(({ ensNameHash }) => (
          this.state === IdentityStates.Creating &&
          this.ensNode &&
          this.ensNode.nameHash === ensNameHash
        )),
      )
      .subscribe(({ address }) => {
        this.state = IdentityStates.Verified;
        this.address = address;
      });
  }

  /**
   * state getter
   */
  public get state(): IdentityStates {
    return this.state$.value;
  }

  /**
   * state setter
   * @param state
   */
  public set state(state: IdentityStates) {
    this.state$.next(state);
  }

  /**
   * ens node getter
   */
  public get ensNode(): IEnsNode {
    return this.ensNode$.value;
  }

  /**
   * ens node setter
   * @param ensNode
   */
  public set ensNode(ensNode: IEnsNode) {
    this.ensNode$.next(ensNode);
  }

  /**
   * verifies ens node
   * @param ensNode
   */
  public async verifyEnsNode(ensNode: IEnsNode): Promise<boolean> {
    let result = false;

    try {
      const { nameHash } = ensNode;
      const { address } = await this.api.getIdentity(nameHash);

      if (address) {
        const { purpose } = await this.api.getMember(address, this.device.address);

        result = !!purpose;

        if (result) {
          this.address = address;
          this.state = IdentityStates.Verified;
          this.ensNode = ensNode;
        }
      }

    } catch (err) {
      result = false;
    }

    return result;
  }
}
