import { NetworkVersions } from "blockid-core";

export namespace ApiResponses {
  export interface IGetSettings {
    ens: {
      serviceAddress: string;
      resolverAddress: string;
      supportedDomains: string[];
    };
    identity: {
      registryAddress: string;
    };
    network: {
      version: NetworkVersions;
      providerEndpoint: string;
    };
  }
}
