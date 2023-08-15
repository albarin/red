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