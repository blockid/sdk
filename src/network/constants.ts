export enum NetworkVersions {
  MainNet = "1",
  Ropsten = "3",
  Rinkeby = "4",
  Kovan = "42",
  Local = "1000",
}

export enum NetworkStatuses {
  Unknown = "UNKNOWN",
  Supported = "SUPPORTED",
  Unsupported = "UNSUPPORTED",
}

export const NETWORK_NAMES = {
  [ NetworkVersions.MainNet ]: "MainNet",
  [ NetworkVersions.Ropsten ]: "Ropsten",
  [ NetworkVersions.Rinkeby ]: "Rinkeby",
  [ NetworkVersions.Kovan ]: "Kovan",
  [ NetworkVersions.Local ]: "Local",
};
