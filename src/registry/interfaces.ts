import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";

export interface IRegistry extends IAttributesProxySubject<IRegistryAttributes> {
  supportedEnsRootNodesNames$?: TUniqueBehaviorSubject<string[]>;
  supportedEnsRootNodesNames?: string[];
  buildCreationSignature(accountEnsName: string): Promise<Buffer>;
}

export interface IRegistryAttributes {
  address: string;
  supportedEnsRootNodesNames: string[];
}
