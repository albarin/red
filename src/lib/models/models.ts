import type { Day } from "./day";

export type Optional<T> = T | undefined;

export interface Days {
  [key: string]: Day;
}