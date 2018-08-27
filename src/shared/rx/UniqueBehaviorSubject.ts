import { BehaviorSubject } from "rxjs";
import { isEqual } from "../utils";

/**
 * UniqueBehaviorSubject
 */
export class UniqueBehaviorSubject<T> extends BehaviorSubject<T> {

  /**
   * constructor
   * @param value
   * @param prepareValue
   */
  constructor(value: T = null, prepareValue: (value: T) => T = null) {
    super(
      prepareValue ? prepareValue(value) : value,
    );

    const next = this.next.bind(this);

    this.next = (value: T) => {
      if (prepareValue) {
        value = prepareValue(value);
      }

      if (isEqual(this.getValue(), value)) {
        return;
      }

      next(value);
    };
  }
}
