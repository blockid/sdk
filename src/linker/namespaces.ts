import { IBN } from "bn.js";

export namespace LinkerActionPayloads {

  export interface IAddIdentityMember {
    identityAddress: string;
    memberAddress: string;
    purposeAddress: string;
    limit: IBN;
    limited: boolean;
  }
}
