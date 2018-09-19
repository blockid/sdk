import { IAttributesProxySubject } from "rxjs-addons";
import { IEnsNameInfo } from "eth-utils";

export interface IEns extends IAttributesProxySubject<IEnsAttributes> {
  lookup(name: string): Promise<IEnsRecord>;
}

export interface IEnsAttributes {
  address: string;
  resolverAddress: string;
}

export interface IEnsRecord extends IEnsNameInfo {
  address: string;
}
