import * as BN from "bn.js";

export enum Units {
  Wei = "Wei",
  Kwei = "Kwei",
  Mwei = "Mwei",
  Gwei = "Gwei",
  Szabo = "Szabo",
  Finney = "Finney",
  Ether = "Ether",
}

const base = new BN(10);

const unitsPow: { [ key: string ]: BN.IBN } = {
  [ Units.Wei ]: new BN(1),
  [ Units.Kwei ]: base.pow(new BN(3)),
  [ Units.Mwei ]: base.pow(new BN(6)),
  [ Units.Gwei ]: base.pow(new BN(9)),
  [ Units.Szabo ]: base.pow(new BN(12)),
  [ Units.Finney ]: base.pow(new BN(15)),
  [ Units.Ether ]: base.pow(new BN(18)),
};

/**
 * converts unit
 * @param value
 * @param from
 * @param to
 */
export function convertUnit(value: number | BN.IBN, from: Units = Units.Wei, to: Units = Units.Ether): BN.IBN {
  let result: BN.IBN = null;

  if (typeof value === "number") {
    value = new BN(value, 10);
  }

  if (from === to) {
    result = value;
  } else {

    try {
      const fromPow = unitsPow[ from ];
      const toPow = unitsPow[ to ];

      if (fromPow.gt(toPow)) {
        result = value.mul(fromPow.div(toPow));
      } else {
        result = value.div(toPow.div(fromPow));
      }
    } catch (err) {
      result = null;
    }

  }

  return result;
}

/**
 * converts eth to wei
 * @param value
 */
export function ethToWei(value: number): BN.IBN {
  value = Math.floor(value * Math.pow(10, 6));
  return convertUnit(value, Units.Szabo, Units.Wei);
}
