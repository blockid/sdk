import { IBN } from "bn.js";

export namespace LinkerActionPayloads {

  export interface IAddMember {
    identity: string;
    address: string;
    purpose?: string;
    limit?: IBN;
    unlimited?: boolean;
  }
}
