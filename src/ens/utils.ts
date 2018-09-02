import "unorm";
import { toAscii } from "idna-uts46-hx";
import { sha3, anyToHex } from "../shared";
import { IEnsInfo } from "./interfaces";

const SEPARATOR = ".";

/**
 * normalizes ens name
 * @param parts
 */
export function normalizeEnsName(...parts: string[]): string {
  let result: string = null;

  let name = parts
    .filter((part) => !!part)
    .join(SEPARATOR)
    .split(SEPARATOR)
    .map((part) => part.toLowerCase().trim())
    .filter((part) => !!part)
    .join(SEPARATOR);

  if (name) {
    try {
      name = toAscii(name.toLowerCase(), {
        transitional: true,
        useStd3ASCII: true,
      });
    } catch (err) {
      name = null;
    }

    if (name) {
      result = name;
    }
  }

  return result;
}

/**
 * get ens mame info
 * @param parts
 */
export function getEnsNameInfo(...parts: string[]): IEnsInfo {
  let result: IEnsInfo = null;

  const name = normalizeEnsName(...parts);

  if (name) {

    result = {
      name,
      nameHash: getEnsNameHash(name),
      label: null,
      labelHash: null,
      rootNode: null,
    };

    const { label, rootNode } = splitEnsName(name);

    if (label && rootNode) {
      result = {
        ...result,
        label,
        labelHash: getEnsLabelHash(label),
        rootNode: {
          ...rootNode,
          nameHash: getEnsNameHash(rootNode.name),
        },
      };
    }
  }

  return result;
}

/**
 * splits ens name
 * @param name
 */
export function splitEnsName(name: string): {
  label: string;
  rootNode: {
    name: string;
  };
} {
  let label: string = null;
  let rootNode: {
    name: string;
  } = null;

  if (name) {
    const parts = name.split(SEPARATOR);
    if (parts.length > 1) {
      label = parts[ 0 ];
      rootNode = {
        name: parts.slice(1).join(SEPARATOR),
      };
    }
  }

  return {
    label,
    rootNode,
  };
}

/**
 * gets ens name hash
 * @param name
 */
export function getEnsNameHash(name: string): string {
  let result: string = null;

  if (name) {
    let node = Buffer.alloc(32, 0);
    const parts = name
      .split(SEPARATOR)
      .map((part) => sha3(part))
      .reverse();

    for (const part of parts) {
      node = sha3(node, part);
    }

    result = anyToHex(node, { add0x: true });
  }

  return result;
}

/**
 * gets ens label hash
 * @param label
 */
export function getEnsLabelHash(label: string): string {
  let result: string = null;

  if (label) {
    result = anyToHex(sha3(label), { add0x: true });
  }

  return result;
}
