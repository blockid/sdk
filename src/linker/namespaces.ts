import { IBN } from "bn.js";

export namespace LinkerActionPayloads {

  export interface IAddMember {
    address: string;
    purpose?: string;
    limit?: IBN;
    unlimited?: boolean;
  }
}
