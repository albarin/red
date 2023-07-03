import Dexie, { type Table } from 'dexie';

export interface Day {
  date: string;
  temperature: number;
}

export class RedDB extends Dexie {
  days!: Table<Day>; 

  constructor() {
    super('reddb');
    this.version(1).stores({
      days: 'date, temperature'
    });
  }
}

export const db = new RedDB();
