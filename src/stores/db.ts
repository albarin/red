import { Day } from '$lib/models/day';
import { iso, toDateTime } from '$lib/utils/date';
import Dexie, { type Table } from 'dexie';
import type { Cycle } from '../lib/models/cycle';

export class RedDB extends Dexie {
  days!: Table<Day>;
  cycles!: Table<Cycle>;

  constructor() {
    super('reddb');
    this.version(1).stores({
      days: 'date, temperature',
      cycles: 'start, end, endOfPeriod, duration',
    });
  }

  async getAllDays(): Promise<Day[]> {
    return await this.days.toArray();
  }

  async getDaysBetween(start: string, end: string): Promise<Day[]> {
    const days = await this.days
      .where('date')
      .between(start, end, true, true)
      .toArray();

    return days.reduce((days, item: Day) => {
      days[item.date] = new Day(item.date, item.temperature, item.flow, item.fluid, item.notes);
      return days;
    }, []);
  }

  async getPreviousWeekDays(date: string): Promise<Day[]> {
    return await this.getDaysBetween(
      iso(toDateTime(date).minus({ days: 6 })),
      date
    );
  }
}

export const db = new RedDB();
