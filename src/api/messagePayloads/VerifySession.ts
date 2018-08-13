import { Message, Field, Type } from "protobufjs";

export interface IVerifySession {
  signed: Buffer;
  member: string;
}

@Type.d("VerifySession")
export class VerifySession extends Message<IVerifySession> {

  @Field.d(1, "bytes")
  public signed: Buffer;

  @Field.d(2, "string")
  public member: string;
}
