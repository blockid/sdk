import { IAttributesProxySubject, TUniqueBehaviorSubject } from "rxjs-addons";

export interface IRegistry extends IAttributesProxySubject<IRegistryAttributes> {
  supportedEnsRootNodesNames$?: TUniqueBehaviorSubject<string[]>;
  supportedEnsRootNodesNames?: string[];
}

export interface IRegistryAttributes {
  address: string;
  supportedEnsRootNodesNames: string[];
}
