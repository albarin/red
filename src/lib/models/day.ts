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
    return this.flow !== undefined && this.flow > 1;
  }

  hasSpotting(): boolean {
    return this.flow !== undefined && this.flow === 0;
  }

  hasTemperature(): boolean {
    return this.temperature !== undefined;
  }

  flowLabel(): string {
    switch (this.flow) {
      case 1:
        return 'light';
      case 2:
        return 'medium';
      case 3:
        return 'heavy';
      default:
        throw new Error('Invalid flow value');
    }
  }
}