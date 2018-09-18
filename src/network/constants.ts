export enum NetworkVersions {
  Unknown = "0",
  MainNet = "1",
  Ropsten = "3",
  Rinkeby = "4",
  Kovan = "42",
  Local = "1000",
}

export enum NetworkStates {
  Unknown = "UNKNOWN",
  Supported = "SUPPORTED",
  Unsupported = "UNSUPPORTED",
}

export const NETWORK_NAMES = {
  unknown: "Unknown",
  local: "Local",
  [ NetworkVersions.MainNet ]: "MainNet",
  [ NetworkVersions.Ropsten ]: "Ropsten",
  [ NetworkVersions.Rinkeby ]: "Rinkeby",
  [ NetworkVersions.Kovan ]: "Kovan",
};
