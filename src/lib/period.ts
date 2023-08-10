import { arrayToObject } from "./utils/array";
import { toDateTime, toISOformat } from "./utils/date";

interface Cycle {
  start: string
  end?: string
  endOfPeriod?: string
  duration?: number
}

interface Day {
  date: string;
  temperature?: number;
  flow?: number;
}

const dayHasFlow = (day: Day) => {
  if (!day) return false;
  return day.flow !== undefined && day.flow > 0
};

const dayIsStartOfPeriod = (day: Day, prevDay: Day) => dayHasFlow(day) && !dayHasFlow(prevDay);

const getEndOfPeriod = (cycle: Cycle, days: Day[]): string | undefined => {
  const startIndex = days.findIndex((day) => day.date === cycle.start);

  for (let i = startIndex + 1; i < days.length; i++) {
    const prevDay = toDateTime(days[i - 1].date);
    if (dayHasFlow(days[i]) && prevDay.plus({ days: 1 }).equals(toDateTime(days[i].date))) {
      continue;
    }
    else {
      return days[i - 1].date;
    }
  }

  return undefined;
}

export const calculateCycles = (days: Day[]) => {
  const daysByDate = arrayToObject(days, 'date');

  let cycles: Cycle[] = [];

  Object.keys(daysByDate).forEach((date, i) => {
    const prevDay = i === 0 ? null : days[i - 1];

    if (dayIsStartOfPeriod(days[i], prevDay)) {
      const cycle = {
        start: date,
      } as Cycle;

      cycles.push(cycle);
    }
  });

  cycles.forEach((cycle, i) => {
    cycles[i].end = cycles[i + 1] ? toISOformat(toDateTime(cycles[i + 1].start).minus({ day: 1 })) : undefined;
    cycles[i].endOfPeriod = getEndOfPeriod(cycle, days);

    if (cycle.end) {
      cycles[i].duration = toDateTime(cycle.end).diff(toDateTime(cycle.start), 'days').days + 1;
    }
  });

  console.log(cycles);
}