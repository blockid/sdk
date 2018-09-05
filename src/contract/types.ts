import { IBN } from "bn.js";
import { INetworkTransactionOptions } from "../network";

export type TContractSendResult = (options?: Partial<INetworkTransactionOptions>) => Promise<string>;
export type TContractEstimateResult = (options?: Partial<INetworkTransactionOptions>) => Promise<IBN>;
