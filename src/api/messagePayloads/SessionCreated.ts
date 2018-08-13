import { Message, Field, Type } from "protobufjs";

export interface ISessionCreated {
  hash: Buffer;
}

@Type.d("SessionCreated")
export class SessionCreated extends Message<ISessionCreated> {

  @Field.d(1, "bytes")
  public hash: Buffer;
}
