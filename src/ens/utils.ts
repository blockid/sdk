import { toAscii } from "idna-uts46-hx";
import { sha3, anyToHex } from "../shared";

const SEPARATOR = ".";

function normalize(name: string): string {
  try {
    name = toAscii(name.toLowerCase(), {
      transitional: true,
      useStd3ASCII: true,
    });
  } catch (err) {
    name = null;
  }

  if (name) {
    name
      .split(SEPARATOR)
      .filter((value) => !!value)
      .join(SEPARATOR);
  }

  return name || null;
}

/**
 * prepares ens mame
 * @param parts
 */
export function prepareEnsName(...parts: string[]): string {
  return normalize(parts.join(SEPARATOR));
}

/**
 * get ens mame info
 * @param parts
 */
export function getEnsNameInfo(...parts: string[]): {
  name: string;
  nameHash: string;
  label: string;
  labelHash: string;
  rootNode: {
    name: string;
    nameHash: string;
  }
} {
  const name = prepareEnsName(...parts);
  if (!name) {
    return null;
  }

  let rootNode: {
    name: string;
    nameHash: string;
  } = null;

  let labelHash: string = null;

  const { label, rootNodeName } = splitEnsName(name);

  if (label && rootNodeName) {
    labelHash = getEnsLabelHash(label);
    rootNode = {
      name: rootNodeName,
      nameHash: getEnsNameHash(rootNodeName),
    };
  }

  return {
    name,
    nameHash: getEnsNameHash(name),
    label,
    labelHash,
    rootNode,
  };
}

/**
 * splits ens name
 * @param name
 */
export function splitEnsName(name: string): {
  label: string;
  rootNodeName: string;
} {
  let label: string = null;
  let rootNodeName: string = null;

  if (name) {
    const parts = name.split(SEPARATOR);
    if (parts.length > 1) {
      label = parts[ 0 ];
      rootNodeName = parts.slice(1).join(SEPARATOR);
    }
  }

  return {
    label,
    rootNodeName,
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
