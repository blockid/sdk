export namespace RegistryContactEvents {
  export enum Types {
    EnsRootNodeAdded = "EnsRootNodeAdded",
    EnsRootNodeRemoved = "EnsRootNodeRemoved",
    SharedAccountCreated = "SharedAccountCreated",
  }

  export interface IEnsRootNodeAdded {
    ensRootNode: string;
  }

  export interface IEnsRootNodeRemoved {
    ensRootNode: string;
  }

  export interface ISharedAccountCreated {
    sharedAccount: string;
    ensLabel: string;
    ensRootNode: string;
    member: string;
  }
}
