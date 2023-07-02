import Dexie, { type Table } from 'dexie';

export interface Day {
  id?: number;
  date: Date;
  temperature: number;
}

export class RedDB extends Dexie {
  days!: Table<Day>; 

  constructor() {
    super('reddb');
    this.version(1).stores({
      days: '++id, date, temperature'
    });
  }
}

export const db = new RedDB();
