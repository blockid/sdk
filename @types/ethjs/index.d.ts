declare module "ethjs" {
  import { IBN } from "bn.js";

  const Eth: {
    HttpProvider: {
      new(endpoint: string): any;
    };

    new(provider?: any): Eth.IEth;
  };

  namespace Eth {
    export type TBlock = IBN | "earliest" | "pending" | "latest";

    export interface IEth {
      net_listening(): Promise<boolean>;
      net_version(): Promise<string>;
      accounts(): Promise<string[]>;
      syncing(): Promise<any>;
      gasPrice(): Promise<IBN>;
      getBlockByNumber(block: Eth.TBlock, fullTx: boolean): Promise<Eth.IBlock>;
      blockNumber(): Promise<IBN>;
      getBlockTransactionCountByHash(hash: string): Promise<IBN>;
      getBlockTransactionCountByNumber(block: Eth.TBlock): Promise<IBN>;
      getTransactionByBlockHashAndIndex(hash: string, index: IBN): Promise<any>;
      getTransactionByBlockNumberAndIndex(block: Eth.TBlock, index: IBN): Promise<Eth.IBlockTransaction>;
      getTransactionReceipt(hash: string): Promise<Eth.ITransactionReceipt>;
      sign(address: string, hash: string): Promise<string>;
      personal_sign(message: string, address: string): Promise<string>;
    }

    export interface IBlock {
      number: IBN;
      hash: string;
      transactions?: Eth.IBlockTransaction[];
    }

    export interface IBlockTransaction {
      blockHash: string;
      blockNumber: IBN;
      from: string;
      gas: IBN;
      gasPrice: IBN;
      hash: string;
      input: string;
      nonce: IBN;
      to: string;
      transactionIndex: IBN;
      value: IBN;
      v: string;
      r: string;
      s: string;
    }

    export interface ITransactionReceipt {
      blockHash: string;
      blockNumber: IBN;
      transactionHash: string;
      transactionIndex: IBN;
      to: string;
      from: string;
      cumulativeGasUsed: IBN;
      gasUsed: IBN;
      contractAddress: string;
      logs: Array<{
        address: string;
        topics: IBN[];
        data: string;
        blockNumber: IBN;
        blockHash: string;
        transactionHash: string;
        transactionIndex: IBN;
        logIndex: IBN;
      }>;
      logsBloom: string;
      status: string;
    }
  }

  export = Eth;
}
