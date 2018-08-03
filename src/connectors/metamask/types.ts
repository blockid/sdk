export type TMetaMaskedWindow = Partial<Window> & {
  ethereum?: any;
  web3?: {
    currentProvider: any;
  }
}
