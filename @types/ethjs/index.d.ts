declare module "ethjs" {
  const Eth: {
    HttpProvider: {
      new(endpoint: string): any;
    };

    new(provider?: any): Eth.IEth;
  };

  namespace Eth {

    export interface IEth {
      net_version(): Promise<string>;
      personal_sign(message: string, address: string): Promise<string>;
    }
  }

  export = Eth;
}
