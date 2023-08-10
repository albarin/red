import { toDateTime, toISOformat } from '$lib/utils/date';
import Dexie, { type Table } from 'dexie';

export interface Day {
  date: string;
  temperature?: number;
  flow?: number;
  fluid?: string;
  notes?: string;
}

interface Cycle {
  start: string;
  end?: string;
  endOfPeriod?: string;
  duration?: number;
}

export class RedDB extends Dexie {
  days!: Table<Day>;
  cycles!: Table<Cycle>;

  constructor() {
    super('reddb');
    this.version(2).stores({
      days: 'date, temperature',
      cycles: 'start, end, endOfPeriod, duration',
    });
  }

  async getAllDays(): Promise<Day[]> {
    return await this.days.toArray();
  }

  async getDaysBetween(start: string, end: string): Promise<Day[]> {
    return await this.days
      .where('date')
      .between(start, end, true, true)
      .toArray();
  }

  async getPreviousWeekDays(date: string): Promise<Day[]> {
    return await this.getDaysBetween(
      toISOformat(toDateTime(date).minus({ days: 6 })),
      date
    );
  }
}

export const db = new RedDB();
