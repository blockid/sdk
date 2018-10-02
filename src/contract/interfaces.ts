import * as BN from "bn.js";
import { IBN } from "bn.js";
import { ILog, IResult } from "ethjs-abi";
import { TUniqueBehaviorSubject } from "rxjs-addons";
import { TContractEstimateResult, TContractSendResult } from "./types";

export interface IContract {
  address$: TUniqueBehaviorSubject<string>;
  address: string;
  at(address: string): IContract;
  decodeLogs(logs: any[]): ILog[];
  getMethodSignature(methodName: string): Buffer;
  encodeMethodInput(methodName: string, ...args: any[]): string;
  decodeMethodOutput<T = IResult>(methodName: string, data: string): T;
  send(methodName: string, ...args: any[]): TContractSendResult;
  call<T = IResult>(methodName: string, ...args: any[]): Promise<T>;
  estimate(methodName: string, ...args: any[]): TContractEstimateResult;
}

export interface IEnsContract extends IContract {
  getResolverAddress(nameHash: string): Promise<string>;
}

export interface IEnsResolverContract extends IContract {
  at(address: string): IEnsResolverContract;
  resolveAddress(nameHash: string): Promise<string>;
}

export interface IRegistryContact extends IContract {
  sharedAccountExists(
    sharedAccount: string,
  ): Promise<boolean>;

  createSharedAccount(
    salt: number,
    ensLabel: string,
    ensRootNode: string,
    memberMessageSignature: string,
    guardianMessageSignature: string,
  ): Promise<string>;
}

export interface ISharedAccountContact extends IContract {
  nonce: Promise<IBN>;
  calcAddMemberSignature(
    nonce: BN.IBN,
    member: string,
    purpose: string,
    limit: BN.IBN,
    unlimited: boolean,
    refundGasBase: number,
    gasPrice: BN.IBN,
  ): Promise<Buffer>;
  calcRemoveMemberSignature(
    nonce: BN.IBN,
    member: string,
    refundGasBase: number,
    gasPrice: BN.IBN,
  ): Promise<Buffer>;
  estimateAddMemberRefundGasBase(
    nonce: BN.IBN,
    member: string,
    purpose: string,
    limit: BN.IBN,
    unlimited: boolean,
  ): BN.IBN;
  estimateRemoveMemberRefundGasBase(
    nonce: BN.IBN,
    member: string,
    refundGasBase: number,
    messageSignature: string,
  ): BN.IBN;
  estimateRefundGasBase(methodName: string, ...args: any[]): BN.IBN;
  addMember(
    nonce: IBN,
    member: string,
    purpose: string,
    limit: IBN,
    unlimited: boolean,
    refundGasBase: number,
    messageSignature: string,
  ): TContractSendResult;
  removeMember(
    nonce: IBN,
    member: string,
    refundGasBase: number,
    messageSignature: string,
  ): TContractSendResult;
}
