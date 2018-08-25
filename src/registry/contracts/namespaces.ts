import { IBN } from "bn.js";

export namespace RegistryContactEvents {

  export enum Types {
    EnsRootNodeAdded = "EnsRootNodeAdded",
    EnsRootNodeRemoved = "EnsRootNodeRemoved",
    IdentityCreated = "IdentityCreated",
    IdentityClaimAdded = "IdentityClaimAdded",
    IdentityClaimRemoved = "IdentityClaimRemoved",
  }

  export interface IEnsRootNodeAdded {
    ensRootNode: string;
  }

  export interface IEnsRootNodeRemoved {
    ensRootNode: string;
  }

  export interface IIdentityCreated {
    identity: string;
    member: string;
    ensLabel: string;
    ensRootNode: string;
  }

  export interface IIdentityClaimAdded {
    identity: string;
    nonce: IBN;
    issuer: string;
    topic: IBN;
    data: string;
    signature: string;
  }

  export interface IIdentityClaimRemoved {
    identity: string;
    issuer: string;
    topic: IBN;
  }
}
