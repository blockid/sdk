import { Namespace, Root, Type, IType } from "protobufjs";

export interface IProtoBufHelper {
  encode<T = any>(key: any, data: T): Buffer;
  decode<T = any>(key: any, data: Buffer): T;
}

export interface IProtoBufDefinition {
  name: string;
  types: {
    [ key: string ]: IType;
  };
}

const globalRoot = new Root();
const namespaces = new Map<string, Namespace>();

/**
 * creates protoBuf helper
 * @param name
 * @param types
 */
export function createProtoBufHelper({ name, types }: IProtoBufDefinition): IProtoBufHelper {
  if (!namespaces.has(name)) {
    namespaces.set(name, globalRoot.define(name));
  }

  const namespace = namespaces.get(name);

  for (const key in types) {
    if (types[ key ]) {
      namespace.add(Type.fromJSON(`Type${key}`, types[ key ]));
    }
  }

  return {
    decode: (key: any, data: any) => {
      const type = namespace.lookupType(`Type${key}`);
      return type.decode(data) as any;
    },
    encode: (key: any, data: any) => {
      const type = namespace.lookupType(`Type${key}`);
      return type.encode(data).finish() as any;
    },
  };
}
