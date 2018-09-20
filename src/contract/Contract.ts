import {
  ILog,
  IResult,
  TLogDecoder,
  TAbi,
  IAbiItem,
  logDecoder,
  decodeMethod,
  encodeMethod,
  encodeSignature,
} from "ethjs-abi";
import { TUniqueBehaviorSubject, UniqueBehaviorSubject } from "rxjs-addons";
import { anyToBuffer } from "eth-utils";
import { IDevice } from "../device";
import { INetwork, INetworkTransactionOptions } from "../network";
import { IContract } from "./interfaces";
import { TContractSendResult, TContractEstimateResult } from "./types";
import {
  errContractUnknownAddress,
  errContractUnknownNetwork,
  errContractUnknownDevice,
} from "./errors";

/**
 * Contract
 */
export class Contract implements IContract {

  /**
   * address subject
   */
  public address$: TUniqueBehaviorSubject<string>;

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
   * @param device
   * @param network
   * @param address
   */
  protected constructor(
    protected abi: TAbi,
    protected device: IDevice = null,
    protected network: INetwork = null,
    address: string = null,
  ) {
    this.address$ = new UniqueBehaviorSubject<string>(address);
    this.logDecoder = logDecoder(abi);

    for (const abiItem of abi) {
      switch (abiItem.type) {
        case "function":
          if (abiItem.name) {
            const signature = anyToBuffer(encodeSignature(abiItem));
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
   * address getter
   */
  public get address(): string {
    return this.address$.value;
  }

  /**
   * address setter
   * @param address
   */
  public set address(address: string) {
    this.address$.next(address);
  }

  /**
   * gets contract at address
   * @param address
   */
  public at(address: string): IContract {
    return new Contract(
      this.abi,
      this.device,
      this.network,
      this.address,
    );
  }

  /**
   * decodes logs
   * @param logs
   */
  public decodeLogs(logs: any[]): ILog[] {
    return this.logDecoder(logs);
  }

  /**
   * gets method signature
   * @param methodName
   */
  public getMethodSignature(methodName: string): Buffer {
    return this.methods[ methodName ] ? this.methods[ methodName ].signature : null;
  }

  /**
   * encodes method input
   * @param methodName
   * @param args
   */
  public encodeMethodInput(methodName: string, ...args: any[]): string {
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
  public decodeMethodOutput<T = IResult>(methodName: string, data: string): T {
    let result: T = null;

    const method = this.methods[ methodName ];
    if (method) {
      result = decodeMethod(method.abiItem, data) as any;
    }

    return result;
  }

  protected async call<T = IResult>(methodName: string, ...args: any[]): Promise<T> {
    this.verifyNetwork();
    this.verifyAddress();

    const data = this.encodeMethodInput(methodName, ...args);
    const output = await this.network.callMessage({
      to: this.address,
      data,
    });

    return this.decodeMethodOutput<T>(methodName, output);
  }

  protected send(methodName: string, ...args: any[]): TContractSendResult {
    this.verifyNetwork();
    this.verifyDevice();
    this.verifyAddress();

    const data = this.encodeMethodInput(methodName, ...args);

    return (options: Partial<INetworkTransactionOptions> = {}) => this.device.sendTransaction({
      to: this.address,
      data,
      ...options,
    });
  }

  protected estimate(methodName: string, ...args: any[]): TContractEstimateResult {
    this.verifyNetwork();
    this.verifyAddress();

    const data = this.encodeMethodInput(methodName, ...args);

    return (options: Partial<INetworkTransactionOptions> = {}) => this.network.estimateTransaction({
      to: this.address,
      data,
      ...options,
    });
  }

  protected verifyAddress(): void {
    if (!this.address) {
      throw errContractUnknownAddress;
    }
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
