import { AppTypes } from "./constants";
import { IAppAttributes } from "./interfaces";

export const internalApp: IAppAttributes = {
  name: "blockid",
  type: AppTypes.Internal,
  callbackUrl: "blockid://sdk",
};
