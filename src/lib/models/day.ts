export class Day {
  date: string;
  temperature?: number;
  flow?: number;
  fluid?: string;
  notes?: string;

  constructor(date: string, temperature?: number, flow?: number, fluid?: string, notes?: string) {
    this.date = date;
    this.temperature = temperature;
    this.flow = flow;
    this.fluid = fluid;
    this.notes = notes;
  }

  hasPeriod(): boolean {
    return this.flow !== undefined && this.flow > 0;
  }

  hasSpotting(): boolean {
    return this.flow !== undefined && this.flow === 0;
  }

  hasTemperature(): boolean {
    return this.temperature !== undefined;
  }
}

export interface Days {
  [key: string]: Day;
}

export const byDate = (days: Day[]): Days => {
  return days.reduce((obj: Days, day: Day) => {
    obj[day.date] = day;
    return obj;
  }, {} as Days);
};
