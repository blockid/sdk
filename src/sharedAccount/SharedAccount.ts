import { AttributesProxySubject } from "rxjs-addons";
import { IApi } from "../api";
import { IDevice } from "../device";
import { INetwork } from "../network";
import { SharedAccountContact, ISharedAccountContact } from "./contracts";
import { ISharedAccount, ISharedAccountOptions, ISharedAccountAttributes } from "./interfaces";

/**
 * Shared account
 */
export class SharedAccount extends AttributesProxySubject<ISharedAccountAttributes> implements ISharedAccount {

  private options: ISharedAccountOptions;

  private contract: ISharedAccountContact;

  /**
   * constructor
   * @param api
   * @param device
   * @param network
   * @param options
   */
  constructor(private api: IApi, private device: IDevice, private network: INetwork, options: ISharedAccountOptions = null) {
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
