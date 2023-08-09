import { toDateTime, toISOformat } from '$lib/utils/date';
import Dexie, { type Table } from 'dexie';
import { DateTime } from 'luxon';

export interface Day {
  date: string;
  temperature?: number;
  flow?: number;
  fluid?: string;
  notes?: string;
}

export class RedDB extends Dexie {
  days!: Table<Day>;

  constructor() {
    super('reddb');
    this.version(1).stores({
      days: 'date, temperature'
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
