import {
  ILog,
  IResult,
  TLogDecoder,
  TAbi,
  IAbiItem,
  logDecoder,
  decodeMethod,
  encodeMethod,
} from "ethjs-abi";
import { IDevice } from "../device";
import { INetwork, INetworkTransactionOptions } from "../network";
import { sha3, AbstractAddressHolder } from "../shared";
import { IContract } from "./interfaces";
import { TContractSendResult, TContractEstimateResult } from "./types";
import {
  errContractUnknownNetwork,
  errContractUnknownDevice,
} from "./errors";

/**
 * Contract
 */
export class Contract extends AbstractAddressHolder implements IContract {

  private readonly logDecoder: TLogDecoder;
  private readonly methods: {
    [ key: string ]: {
      abiItem: IAbiItem;
      signature: Buffer;
    };
  } = {};

  /**
   * constructor
   * @param abi
   * @param network
   * @param device
   * @param address
   */
  constructor(
    protected abi: TAbi,
    protected network: INetwork = null,
    protected device: IDevice = null,
    address: string = null,
  ) {
    super();

    this.address = address;
    this.logDecoder = logDecoder(abi);

    for (const abiItem of abi) {
      switch (abiItem.type) {
        case "function":
          if (abiItem.name) {
            const inputTypes = (abiItem.inputs || []).map(({ type }) => type);
            const signature = sha3(`${abiItem.name}(${inputTypes.join(",")})`).slice(0, 10);
            this.methods[ abiItem.name ] = {
              abiItem,
              signature,
            };
          }
          break;
      }
    }
  }

  /**
   * decodes logs
   * @param logs
   */
  public decodeLogs(logs: any[]): ILog[] {
    return this.logDecoder(logs);
  }

  /**
   * encodes method input
   * @param methodName
   * @param args
   */
  protected encodeMethodInput(methodName: string, ...args: any[]): string {
    let result: string = null;

    const method = this.methods[ methodName ];
    if (method) {
      result = encodeMethod(method.abiItem, args);
    }

    return result;
  }

  /**
   * decodes method output
   * @param methodName
   * @param data
   */
  protected decodeMethodOutput<T = IResult>(methodName: string, data: string): T {
    let result: T = null;

    const method = this.methods[ methodName ];
    if (method) {
      result = decodeMethod(method.abiItem, data) as any;
    }

    return result;
  }

  /**
   * call
   * @param methodName
   * @param args
   */
  protected async call<T = IResult>(methodName: string, ...args: string[]): Promise<T> {
    this.verifyNetwork();
    this.verifyAddress();

    const input = this.encodeMethodInput(methodName, ...args);
    const output = await this.network.callMessage({
      to: this.address,
      data: input,
    });

    return this.decodeMethodOutput<T>(methodName, output);
  }

  /**
   * send
   * @param methodName
   * @param value
   * @param args
   */
  protected send(methodName: string, ...args: string[]): TContractSendResult {
    this.verifyNetwork();
    this.verifyDevice();
    this.verifyAddress();

    const data = this.encodeMethodInput(methodName, ...args);

    return (options: Partial<INetworkTransactionOptions>) => this.device.sendTransaction({
      to: this.address,
      data,
      ...options,
    });
  }

  /**
   * estimate
   * @param methodName
   * @param value
   * @param args
   */
  protected estimate(methodName: string, ...args: string[]): TContractEstimateResult {
    this.verifyNetwork();
    this.verifyAddress();

    const data = this.encodeMethodInput(methodName, ...args);

    return (options: Partial<INetworkTransactionOptions>) => this.network.estimateTransaction({
      to: this.address,
      data,
      ...options,
    });
  }

  protected verifyNetwork(): void {
    if (!this.network) {
      throw errContractUnknownNetwork;
    }
  }

  protected verifyDevice(): void {
    if (!this.device) {
      throw errContractUnknownDevice;
    }
  }
}
