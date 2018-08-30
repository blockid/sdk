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
  constructor(value: T = null, prepareValue: (value: T, oldValue: T) => T = null) {
    super(
      prepareValue ? prepareValue(value, null) : value,
    );

    const next = this.next.bind(this);

    this.next = (value: T) => {
      if (prepareValue) {
        value = prepareValue(value, this.getValue());
      }

      if (isEqual(this.getValue(), value)) {
        return;
      }

      next(value);
    };
  }
}
