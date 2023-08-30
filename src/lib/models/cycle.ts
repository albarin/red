export class Cycle {
  number: number;
  start: string;
  end?: string;
  endOfPeriod?: string;
  duration?: number;

  constructor(number: number, start: string, end?: string, endOfPeriod?: string, duration?: number) {
    this.number = number;
    this.start = start;
    this.end = end;
    this.endOfPeriod = endOfPeriod;
    this.duration = duration;
  }
}