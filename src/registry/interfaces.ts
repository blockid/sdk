import { IAttributesProxySubject } from "rxjs-addons";

export interface IRegistry extends IAttributesProxySubject<IRegistryAttributes> {
  buildAccountDeploymentSignature(): Promise<Buffer>;
  deployAccount(deviceSignature: Buffer, guardianSignature: Buffer): Promise<boolean>;
}

export interface IRegistryAttributes {
  address: string;
  supportedEnsRootNodesNames: string[];
}
