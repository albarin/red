export class Cycle {
  id?: number;
  number: number;
  start: string;
  end?: string;
  endOfPeriod?: string;
  duration?: number;

  constructor(number: number, start: string, end?: string, endOfPeriod?: string, duration?: number, id?: number) {
    this.number = number;
    this.start = start;
    this.end = end;
    this.endOfPeriod = endOfPeriod;
    this.duration = duration;
    this.id = id;
  }
}