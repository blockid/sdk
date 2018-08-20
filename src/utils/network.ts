import * as Eth from "ethjs";

/**
 * creates network http provider
 * @param endpoint
 */
export function createNetworkHttpProvider(endpoint: string): any {
  return new Eth.HttpProvider(endpoint);
}
