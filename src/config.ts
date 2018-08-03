import { NetworkVersions } from "./network";
import { IConfig } from "./interfaces";

export const defaultConfig: IConfig = {
  network: {
    endpoints: {
      [ NetworkVersions.MainNet ]: "https://mainnet.infura.io/xY0BoPOcZsiZItYLBLvj",
      [ NetworkVersions.Ropsten ]: "https://ropsten.infura.io/xY0BoPOcZsiZItYLBLvj",
      [ NetworkVersions.Rinkeby ]: "https://rinkeby.infura.io/xY0BoPOcZsiZItYLBLvj",
      [ NetworkVersions.Kovan ]: "https://kovan.infura.io/xY0BoPOcZsiZItYLBLvj",
      [ NetworkVersions.Local ]: "http://localhost:8545",
    },
  },
};