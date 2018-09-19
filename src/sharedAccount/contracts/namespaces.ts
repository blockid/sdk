import { IBN } from "bn.js";

export namespace SharedAccountContactEvents {

  export enum Types {
    MemberAdded = "MemberAdded",
    MemberLimitUpdated = "MemberLimitUpdated",
    MemberManagerUpdated = "MemberManagerUpdated",
    MemberRemoved = "MemberRemoved",
    NonceUpdated = "NonceUpdated",
    GasRefunded = "GasRefunded",
    TransactionExecuted = "TransactionExecuted",
  }

  export interface IMemberAdded {
    sender: string;
    nonce: IBN;
    member: string;
    purpose: string;
    limit: IBN;
    unlimited: boolean;
    manager: string;
  }

  export interface IMemberLimitUpdated {
    sender: string;
    nonce: IBN;
    member: string;
    limit: IBN;
  }

  export interface IMemberManagerUpdated {
    sender: string;
    nonce: IBN;
    member: string;
    manager: string;
  }

  export interface IMemberRemoved {
    sender: string;
    nonce: IBN;
    member: string;
  }

  export interface INonceUpdated {
    nonce: IBN;
  }

  export interface IGasRefunded {
    recipient: string;
    gasAmount: IBN;
    gasPrice: IBN;
  }

  export interface ITransactionExecuted {
    sender: string;
    nonce: IBN;
    to: string;
    value: IBN;
    data: string;
    succeeded: boolean;
  }
}
