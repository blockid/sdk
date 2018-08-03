export function jsonReviver(key: any, value: any): any {
  if (value && typeof value === "object") {
    switch (value.type) {
      case "Buffer":
        value = Buffer.from(value.data);
        break;
    }
  }
  return value;
}

export function jsonReplacer(key: string, value: any): any {
  if (value instanceof Buffer) {
    value = {
      type: "Buffer",
      data: [
        ...value,
      ],
    };
  }

  return value;
}
