import * as BN from "bn.js";
import { anyToBuffer, abiEncodePacked } from "eth-utils";
import { IDevice } from "../device";
import { INetwork } from "../network";
import { Contract } from "./Contract";
import { ISharedAccountContact } from "./interfaces";
import { TContractSendResult } from "./types";
import { SharedAccountAbi } from "./abi";

/**
 * Shared account contact
 */
export class SharedAccountContact extends Contract implements ISharedAccountContact {

  /**
   * constructor
   * @param device
   * @param network
   * @param address
   */
  constructor(device: IDevice = null, network: INetwork = null, address: string = null) {
    super(SharedAccountAbi, device, network, address);
  }

  /**
   * nonce getter
   */
  public get nonce(): Promise<BN.IBN> {
    return this
      .call("nonce")
      .then((result) => {
        return result[ "0" ] || null;
      });
  }

  /**
   * calcs add member signature
   * @param nonce
   * @param member
   * @param purpose
   * @param limit
   * @param unlimited
   * @param refundGasBase
   * @param gasPrice
   */
  public calcAddMemberSignature(
    nonce: BN.IBN,
    member: string,
    purpose: string,
    limit: BN.IBN,
    unlimited: boolean,
    refundGasBase: number,
    gasPrice: BN.IBN,
  ): Promise<Buffer> {
    const message = abiEncodePacked(
      "address",  // address(this)
      "bytes",    // msg.sig
      "uint256",  // _nonce
      "address",  // _member
      "address",  // _purpose
      "uint256",  // _limit
      "bool",     // _unlimited
      "uint256",  // _refundGasBase
      "uint256",  // tx.gasprice
    )(
      this.address,
      this.getMethodSignature("addMember"),
      nonce,
      member,
      purpose,
      limit,
      unlimited,
      refundGasBase,
      gasPrice,
    );

    return this.device.signPersonalMessage(message);
  }

  /**
   * calcs remove member signature
   * @param nonce
   * @param member
   * @param refundGasBase
   * @param gasPrice
   */
  public calcRemoveMemberSignature(
    nonce: BN.IBN,
    member: string,
    refundGasBase: number,
    gasPrice: BN.IBN,
  ): Promise<Buffer> {
    const message = abiEncodePacked(
      "address",  // address(this)
      "bytes",    // msg.sig
      "uint256",  // _nonce
      "address",  // _member
      "uint256",  // _refundGasBase
      "uint256",  // tx.gasprice
    )(
      this.address,
      this.getMethodSignature("RemoveMember"),
      nonce,
      member,
      refundGasBase,
      gasPrice,
    );

    return this.device.signPersonalMessage(message);
  }

  /**
   * estimates add member refund gas base
   * @param nonce
   * @param member
   * @param purpose
   * @param limit
   * @param unlimited
   */
  public estimateAddMemberRefundGasBase(
    nonce: BN.IBN,
    member: string,
    purpose: string,
    limit: BN.IBN,
    unlimited: boolean,
  ): BN.IBN {
    return this.estimateRefundGasBase(
      "addMember",
      nonce,
      member,
      purpose,
      limit,
      unlimited,
    );
  }

  /**
   * removes member
   * @param nonce
   * @param member
   * @param refundGasBase
   * @param messageSignature
   */
  public estimateRemoveMemberRefundGasBase(
    nonce: BN.IBN,
    member: string,
    refundGasBase: number,
    messageSignature: string,
  ): BN.IBN {
    return this.estimateRefundGasBase(
      "removeMember",
      nonce,
      member,
    );
  }

  /**
   * estimates refund gas base
   * @param methodName
   * @param args
   */
  public estimateRefundGasBase(methodName: string, ...args: any[]): BN.IBN {
    let extraGas = 7600 + 300;

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

    return new BN(extraGas, 10);
  }

  /**
   * adds member
   * @param nonce
   * @param member
   * @param purpose
   * @param limit
   * @param unlimited
   * @param refundGasBase
   * @param messageSignature
   */
  public addMember(
    nonce: BN.IBN,
    member: string,
    purpose: string,
    limit: BN.IBN,
    unlimited: boolean,
    refundGasBase: number,
    messageSignature: string,
  ): TContractSendResult {
    return this.send(
      "addMember",
      nonce,
      member,
      purpose,
      limit,
      unlimited,
      refundGasBase,
      messageSignature,
    );
  }

  /**
   * removes member
   * @param nonce
   * @param member
   * @param refundGasBase
   * @param messageSignature
   */
  public removeMember(
    nonce: BN.IBN,
    member: string,
    refundGasBase: number,
    messageSignature: string,
  ): TContractSendResult {
    return this.send(
      "removeMember",
      nonce,
      member,
      refundGasBase,
      messageSignature,
    );
  }
}
