import { AppTypes } from "./constants";

export interface IAppAttributes {
  name: string;
  type?: AppTypes;
  address?: string;
  title?: string;
  description?: string;
  url?: string;
  callbackUrl?: string;
  updatedAt?: Date;
}
