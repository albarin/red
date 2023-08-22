import { Day, type Days } from '$lib/models/day';
import { iso, toDateTime } from '$lib/utils/date';
import Dexie, { type Table } from 'dexie';
import { Cycle } from '../lib/models/cycle';
import dexieCloud from "dexie-cloud-addon";
import { PUBLIC_DATABASE_URL } from '$env/static/public'

export class RedDB extends Dexie {
  days!: Table<Day>;
  cycles!: Table<Cycle>;

  constructor() {
    super('reddb', { addons: [dexieCloud] });
    this.version(1).stores({
      days: '@id, date, temperature',
      cycles: '@id, start, end, endOfPeriod, duration',
    });

    this.cloud.configure({
      databaseUrl: PUBLIC_DATABASE_URL || '',
      requireAuth: false,
    });
  }

  async getAllDays(): Promise<Day[]> {
    const days = await this.days.toArray();

    return days.map((day: Day) => {
      return new Day(day.date, day.temperature, day.flow, day.fluid, day.notes, day.id)
    });
  }

  async getAllCycles(): Promise<Cycle[]> {
    const cycles = await this.cycles.toArray();

    return cycles.map((cycle: Cycle) => {
      return new Cycle(cycle.number, cycle.start, cycle.end, cycle.endOfPeriod, cycle.duration, cycle.id)
    });
  }

  async getDaysBetween(start: string, end: string): Promise<Days> {
    const days = await this.days
      .where('date')
      .between(start, end, true, true)
      .toArray();

    return days.reduce((days, item: Day) => {
      days[item.date] = new Day(item.date, item.temperature, item.flow, item.fluid, item.notes, item.id);
      return days;
    }, []);
  }

  async getPreviousWeekDays(date: string): Promise<Day[]> {
    return await this.days
      .where('date')
      .between(iso(toDateTime(date).minus({ days: 6 })), date, true, true)
      .toArray();
  }
}

export const db = new RedDB();
