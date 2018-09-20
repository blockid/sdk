export enum NetworkVersions {
  Main = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
}

export enum NetworkTypes {
  Main = "main",
  Ropsten = "ropsten",
  Rinkeby = "rinkeby",
  Kovan = "kovan",
  Local = "local",
}

export enum NetworkStates {
  Unknown = "UNKNOWN",
  Supported = "SUPPORTED",
  Unsupported = "UNSUPPORTED",
}

export const NETWORK_NAMES = {
  [ NetworkTypes.Main ]: "MainNet",
  [ NetworkTypes.Ropsten ]: "Ropsten",
  [ NetworkTypes.Rinkeby ]: "Rinkeby",
  [ NetworkTypes.Kovan ]: "Kovan",
  [ NetworkTypes.Local ]: "Local",
};
