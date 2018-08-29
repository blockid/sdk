import { IAbstractAttributesHolder, TUniqueBehaviorSubject } from "../shared";

export interface IEns extends IAbstractAttributesHolder<IEnsAttributes> {
  supportedRootNodes$?: TUniqueBehaviorSubject<IEnsNode[]>;
  supportedRootNodes?: IEnsNode[];
  isRootNodeSupported(rootNode: Partial<IEnsNode>): boolean;
  lookup(name: string): Promise<IEnsRecord>;
}

export interface IEnsAttributes {
  address: string;
  resolverAddress: string;
  supportedRootNodes: IEnsNode[];
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
