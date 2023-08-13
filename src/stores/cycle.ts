export class Cycle {
  start: string;
  end?: string;
  endOfPeriod?: string;
  duration?: number;

  constructor(start: string, end?: string, endOfPeriod?: string, duration?: number) {
    this.start = start;
    this.end = end;
    this.endOfPeriod = endOfPeriod;
    this.duration = duration;
  }
}