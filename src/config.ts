import { NetworkVersions } from "./network";
import { IConfig } from "./interfaces";

export const config: IConfig = {
  network: {
    endpoints: {
      [ NetworkVersions.MainNet ]: "https://mainnet.infura.io/",
      [ NetworkVersions.Ropsten ]: "https://ropsten.infura.io/",
      [ NetworkVersions.Rinkeby ]: "https://rinkeby.infura.io/",
      [ NetworkVersions.Kovan ]: "https://kovan.infura.io/",
      [ NetworkVersions.Local ]: "http://localhost:8545",
    },
  },
};