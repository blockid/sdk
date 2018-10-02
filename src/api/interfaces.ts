import { IBN } from "bn.js";
import * as BN from "bn.js";
import { Subject } from "rxjs";
import { TUniqueBehaviorSubject, IAttributesProxySubject, IErrorSubject } from "rxjs-addons";
import { IAccountAttributes, IAccountDeviceAttributes } from "../account";
import { IDeviceAttributes } from "../device";
import { IAppAttributes } from "../app";
import { ISdkSettings } from "../sdk";
import { IApiEvent } from "./events";
import { ApiConnectionStates, ApiSessionStates } from "./constants";

export interface IApi {
  connection: IApiConnection;
  session: IApiSession;
  options$: TUniqueBehaviorSubject<IApiOptions>;
  options: IApiOptions;
  event$: Subject<IApiEvent>;
  error$: IErrorSubject;
  createSession(): Promise<void>;
  destroySession(): void;
  muteConnection(): void;
  unMuteConnection(): void;
  signSecureAction(recipient: string, signature: Buffer): void;
  getSettings(): Promise<ISdkSettings>;
  getAccount(account: Partial<IAccountAttributes>): Promise<IAccountAttributes>;
  getAccountDevices(account: Partial<IAccountAttributes>): Promise<IAccountDeviceAttributes[]>;
  getAccountDevice(account: Partial<IAccountAttributes>, device: Partial<IDeviceAttributes>): Promise<IAccountDeviceAttributes>;
  createAccount(account: Partial<IAccountAttributes>): Promise<IAccountAttributes>;
  getAccountGuardianDeploymentSignature(account: Partial<IAccountAttributes>, signature: Buffer): Promise<Buffer>;
  createAccountDevice(
    account: Partial<IAccountAttributes>,
    device: Partial<IDeviceAttributes>,
    app?: Partial<IAppAttributes>,
    limit?: BN.IBN,
    signature?: Buffer,
  ): Promise<IAccountDeviceAttributes>;
  deployAccountDevice(
    account: Partial<IAccountAttributes>,
    device: Partial<IDeviceAttributes>,
    nonce: IBN,
    signature: Buffer,
    gasPrice: IBN,
  ): Promise<IAccountDeviceAttributes>;
  getApps(page?: number): Promise<IApiListData<IAppAttributes>>;
  getApp(appNameOrAddress: string): Promise<IAppAttributes>;
}

export interface IApiOptions {
  host?: string;
  port?: number;
  ssl?: boolean;
  reconnectTimeout?: number;
  manualAuth?: boolean;
}

export interface IApiConnection extends IAttributesProxySubject<IApiConnectionAttributes> {
  state?: ApiConnectionStates;
  muted$?: TUniqueBehaviorSubject<boolean>;
  muted?: boolean;
  data$: Subject<Buffer>;
  error$: IErrorSubject;
  opened: boolean;
  open(endpoint: string, protocol: string): void;
  close(emitState?: boolean): void;
  send(data: Buffer): void;
}

export interface IApiSession extends IAttributesProxySubject<IApiSessionAttributes> {
  state$?: TUniqueBehaviorSubject<ApiSessionStates>;
  token?: string;
  verified: boolean;
  signHash(hash: Buffer): Promise<{
    signer: string;
    signature: Buffer;
  }>;
  setAsVerifying(token?: string): void;
  setAsVerified(token: string): void;
  setAsDestroyed(): void;
}

export interface IApiSessionAttributes {
  token: string;
  state: ApiSessionStates;
}

export interface IApiConnectionAttributes {
  state: ApiConnectionStates;
  muted: boolean;
}

export interface IApiRequest<B = any> {
  method: string;
  path: string;
  body?: B;
}

export interface IApiResponse<D = any> {
  data?: D;
  error?: string;
  errors?: { [ key: string ]: string };
}

export interface IApiListData<T> {
  rows: T[];
  currentPage: number;
  totalPages: number;
}
