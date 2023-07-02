import Dexie, { type Table } from 'dexie';

export interface Day {
  id?: number;
  name: string;
  age: number;
}

export class RedDB extends Dexie {
  days!: Table<Day>; 

  constructor() {
    super('reddb');
    this.version(1).stores({
      friends: '++id, date, temperature'
    });
  }
}

export const db = new RedDB();
