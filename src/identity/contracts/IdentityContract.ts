import * as BN from "bn.js";
import { Contract, TContractEstimateResult, TContractSendResult } from "../../contract";
import { IDevice } from "../../device";
import { INetwork } from "../../network";
import { anyToBuffer } from "../../shared/utils";
import { IIdentityContract } from "./interfaces";
import abi from "./IdentityAbi";

/**
 * Identity contract
 */
export class IdentityContract extends Contract implements IIdentityContract {

  /**
   * constructor
   * @param network
   * @param device
   * @param address
   */
  constructor(network: INetwork = null, device: IDevice = null, address: string = null) {
    super(abi, network, device, address);
  }

  /**
   * at
   * @param address
   */
  public at(address: string): IIdentityContract {
    return new IdentityContract(this.network, this.device, address);
  }

  /**
   * balance getter
   */
  public get balance(): Promise<BN.IBN> {
    return this.network.getBalance(this);
  }

  /**
   * nonce getter
   */
  public get nonce(): Promise<BN.IBN> {
    return (async () => {
      const data = await this.call("nonce");
      return data && BN.isBN(data[ "0" ]) ? data[ "0" ] : 0;
    })();
  }

  /**
   * estimates extra gas
   * @param methodName
   * @param args
   */
  public estimateExtraGas(methodName: string, ...args: any[]): BN.IBN {
    let result: BN.IBN = null;

    if (methodName.startsWith("gasRelayed")) {
      let extraGas = 7600 + 200;

      const signature = Buffer.alloc(65).fill(0xFF);
      const data = anyToBuffer(this.encodeMethodInput(
        methodName,
        ...args,
        0,
        signature,
      ));

      for (const value of data) {
        extraGas += value ? 68 : 4;
      }

      result = new BN(extraGas, 10);
    }

    return result;
  }

  /**
   * sends gas relayed method
   * @param methodName
   * @param args
   */
  public sendGasRelayedMethod(methodName: string, ...args: any[]): TContractSendResult {
    if (!methodName.startsWith("gasRelayed")) {
      return null;
    }

    return this.send(methodName, ...args);
  }

  /**
   * estimates gas relayed method
   * @param methodName
   * @param args
   */
  public estimateGasRelayedMethod(methodName: string, ...args: any[]): TContractEstimateResult {
    if (!methodName.startsWith("gasRelayed")) {
      return null;
    }

    return this.estimate(methodName, ...args);
  }

  /**
   * adds member
   * @param nonce
   * @param address
   * @param purpose
   * @param limit
   * @param unlimited
   */
  public addMember(nonce: BN.IBN, address: string, purpose: string, limit: BN.IBN, unlimited: boolean): Promise<string> {
    return this.send("addMember", nonce, address, purpose, limit, unlimited)();
  }

  /**
   * removes member
   * @param nonce
   * @param address
   */
  public removeMember(nonce: BN.IBN, address: string): Promise<string> {
    return this.send("removeMember", nonce, address)();
  }
}
