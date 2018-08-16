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
  let namespace: Namespace = namespaces.get(name);

  if (!namespaces.has(name)) {
    namespace = globalRoot.define(name);
    namespaces.set(name, namespace);

    for (const key in types) {
      if (types[ key ]) {
        const typeName = `Type${key}`;
        namespace.add(Type.fromJSON(typeName, types[ key ]));
      }
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
