import { IBN } from "bn.js";
import { IContract, TContractEstimateResult, TContractSendResult } from "../../contract";

export interface IIdentityContract extends IContract {
  balance: Promise<IBN>;
  nonce: Promise<IBN>;
  at(address: string): IIdentityContract;
  estimateExtraGas(methodName: string, ...args: any[]): IBN;
  sendGasRelayedMethod(methodName: string, ...args: any[]): TContractSendResult;
  estimateGasRelayedMethod(methodName: string, ...args: any[]): TContractEstimateResult;
  addMember(nonce: IBN, address: string, purpose: string, limit: IBN, unlimited: boolean): Promise<string>;
  removeMember(nonce: IBN, address: string): Promise<string>;
}
