import { map } from "rxjs/operators";
import { UniqueBehaviorSubject, TUniqueBehaviorSubject } from "../rx";
import { IAbstractAttributesHolder, IAttributeOptions } from "./interfaces";
import { TAttributesSchema } from "./types";

/**
 * Abstract attributes holder
 */
export abstract class AbstractAttributesHolder<T, K extends keyof T = keyof T> implements IAbstractAttributesHolder<T> {

  /**
   * attributes subject
   */
  public attributes$: TUniqueBehaviorSubject<T>;

  /**
   * constructor
   * @param schema
   * @param attributes
   */
  protected constructor(private schema: TAttributesSchema<T>, attributes: T = null) {
    this.attributes$ = new UniqueBehaviorSubject<T>(
      attributes,
      (attributes) => this.prepareAttributes(attributes),
    );

    if (schema) {
      for (const name in schema) {
        if (schema.hasOwnProperty(name)) {
          const { subject, setter, getter }: IAttributeOptions = {
            subject: false,
            getter: false,
            setter: false,
            ...(schema[ name ] === true ? {
              subject: true,
              getter: true,
              setter: true,
            } : schema[ name ] as any),
          };

          if (subject) {
            const subject$ = this.getAttribute$(name as any);

            Object.defineProperty(this, `${name}$`, {
              get: () => subject$,
            });
          }

          Object.defineProperty(this, name, {
            ...(getter ? {
              get: () => this.getAttribute(name as any, null),
            } : {}),
            ...(setter ? {
              set: (value: T[K]) => this.setAttribute(name as any, value),
            } : {}),
          });
        }
      }
    }
  }

  /**
   * attributes getter
   */
  public get attributes(): T {
    return this.attributes$.value;
  }

  /**
   * attributes setter
   * @param attributes
   */
  public set attributes(attributes: T) {
    this.attributes$.next(attributes);
  }

  /**
   * gets attribute subject
   * @param name
   */
  protected getAttribute$(name: K): TUniqueBehaviorSubject<T[K]> {
    const result = new UniqueBehaviorSubject<any>();
    this
      .attributes$
      .pipe(
        map((attributes) => attributes ? attributes[ name ] : null),
      )
      .subscribe(result);

    result
      .subscribe((value) => this.setAttribute(name, value));

    return result;
  }

  /**
   * gets attribute
   * @param name
   * @param defaults
   */
  protected getAttribute<R = T[K]>(name: K, defaults: T[K] = null): R {
    return (
      this.attributes &&
      typeof this.attributes[ name ] !== "undefined"
    )
      ? this.attributes[ name ] as any
      : defaults;
  }

  /**
   * sets attribute
   * @param name
   * @param value
   */
  protected setAttribute(name: K, value: T[K]): void {
    const attributes: any = this.attributes || {};
    attributes[ name ] = value;
    this.attributes = attributes;
  }

  /**
   * updates attributes
   * @param attributes
   */
  protected updateAttributes(attributes: Partial<T>): void {
    this.attributes = attributes
      ? {
        ...(this.attributes || {}),
        ...(attributes as any),
      } as any
      : null;
  }

  /**
   * prepares attributes
   * @param attributes
   */
  protected prepareAttributes(attributes: T): T {
    return attributes;
  }
}
