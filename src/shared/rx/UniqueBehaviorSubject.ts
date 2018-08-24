import { BehaviorSubject } from "rxjs";

/**
 * UniqueBehaviorSubject
 */
export class UniqueBehaviorSubject<T> extends BehaviorSubject<T> {

  /**
   * constructor
   * @param value
   */
  constructor(value: T = null) {
    super(value);

    const next = this.next.bind(this);

    this.next = (value: T) => {
      const current = this.value;

      if (current === value) {
        return;
      }

      if (
        typeof current === "object" &&
        typeof value === "object" &&
        current &&
        value
      ) {
        const keys = [
          ...new Set([
            ...Object.keys(current),
            ...Object.keys(value),
          ]),
        ];

        if (keys.every((key) => current[ key ] !== value[ key ])) {
          return;
        }
      }

      next(next);
    };
  }
}
