import { IApiConnection } from "./interfaces";

export type TApiConnectionFactory = (endpoint: string) => IApiConnection;
