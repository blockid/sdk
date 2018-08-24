import { TUniqueBehaviorSubject, IAbstractAddressHolder } from "../shared";

export interface IEns extends IAbstractAddressHolder {
  resolverAddress$: TUniqueBehaviorSubject<string>;
  resolverAddress: string;
  supportedRootNodes$: TUniqueBehaviorSubject<IEnsNode[]>;
  supportedRootNodes: IEnsNode[];
  lookup(name: string): Promise<IEnsRecord>;
}

export interface IEnsNode {
  name: string;
  nameHash: string;
}

export interface IEnsRecord extends IEnsNode {
  supported?: boolean;
  address?: string;
  label: string;
  labelHash: string;
  rootNode: IEnsNode;
}
