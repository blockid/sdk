import { BehaviorSubject } from "rxjs";

export type TUniqueBehaviorSubject<T> = BehaviorSubject<T>;

export type TErrorSubjectWrapped<T = any, R = T | Promise<T>> = R | (() => R);
