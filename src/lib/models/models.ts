import type { Cycle } from "./cycle";
import type { Day } from "./day";

export type Optional<T> = T | undefined;

export interface Days {
  [key: string]: Day;
}

export type Cycles = Cycle[];

export const byDate = (days: Day[]): Days => {
  return days.reduce((obj: Days, day: Day) => {
    obj[day.date] = day;
    return obj;
  }, {} as Days);
};
