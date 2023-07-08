import Dexie, { type Table } from 'dexie';

export interface Day {
  date: string;
  temperature?: number;
  flow?: number;
}

export class RedDB extends Dexie {
  days!: Table<Day>;

  constructor() {
    super('reddb');
    this.version(1).stores({
      days: 'date, temperature'
    });
  }

  async getDaysBetween(start: string, end: string) {
    return await this.days
      .where('date')
      .between(start, end)
      .toArray();
  }
}

export const db = new RedDB();
