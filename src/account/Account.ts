import { AttributesProxySubject } from "rxjs-addons";
import { SharedAccountContact, ISharedAccountContact } from "../contract";
import { IApi } from "../api";
import { IDevice } from "../device";
import { INetwork } from "../network";
import { IAccount, IAccountOptions, IAccountAttributes } from "./interfaces";

/**
 * Account
 */
export class Account extends AttributesProxySubject<IAccountAttributes> implements IAccount {

  private options: IAccountOptions;

  private contract: ISharedAccountContact;

  /**
   * constructor
   * @param api
   * @param device
   * @param network
   * @param options
   */
  constructor(private api: IApi, private device: IDevice, private network: INetwork, options: IAccountOptions = null) {
    super(null, {
      schema: {
        state: true,
        address: true,
        ensName: true,
      },
    });

    this.options = {
      useGasRelay: true,
      ...(options || {}),
    };

    this.contract = new SharedAccountContact(device, network);

    this
      .getAttribute$("address")
      .subscribe(this.contract.address$);
  }
}
