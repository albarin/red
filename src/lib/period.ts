import { Interval } from "luxon";
import { arrayToObject } from "./utils/array";
import { iso, toDateTime } from "./utils/date";

export interface Cycle {
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

export interface CyclesStats {
  cyclesLength: number;
  averageCycleLength: number;
  standardDeviationCycleLength: number;
  shortesCycle: Cycle;
  longestCycle: Cycle;
}

const dayHasFlow = (day: Day) => {
  if (!day) return false;
  return day.flow !== undefined && day.flow > 0
};

const dayIsStartOfPeriod = (day: Day, prevDay: Day | undefined) => dayHasFlow(day) && !dayHasFlow(prevDay);

const getEndOfPeriod = (cycle: Cycle, days: { [key: string]: Day }): string | undefined => {
  if (!cycle.end) {
    return undefined
  };

  const cycleDays = Interval.fromDateTimes(
    toDateTime(cycle.start),
    toDateTime(cycle.end)
  ).splitBy({ days: 1 });

  for (let i = 1; i < cycleDays.length; i++) {
    const date = iso(cycleDays[i]);

    if (!dayHasFlow(days[date])) {
      return iso(cycleDays[i - 1]);
    }
  }

  return undefined;
}

export const calculateCycles = (days: Day[]): Cycle[] | undefined => {
  const daysByDate = arrayToObject(days, 'date');

  const cycles: Cycle[] = [];

  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const allDays = Interval.fromDateTimes(
    toDateTime(firstDay.date),
    toDateTime(lastDay.date).plus({ day: 1 })
  ).splitBy({ days: 1 });

  for (let i = 0; i < allDays.length; i++) {
    const day = iso(allDays[i]);
    const prevDay = i === 0 ? undefined : iso(allDays[i - 1]);

    if (!prevDay && dayHasFlow(daysByDate[day])) {
      cycles.push({
        number: cycles.length + 1,
        start: day,
      } as Cycle);
      continue;
    }

    if (prevDay && dayIsStartOfPeriod(daysByDate[day], daysByDate[prevDay])) {
      cycles.push({
        number: cycles.length + 1,
        start: day,
      } as Cycle);
    }
  }

  cycles.forEach((cycle, i) => {
    cycles[i].end = cycles[i + 1] ? iso(toDateTime(cycles[i + 1].start).minus({ day: 1 })) : undefined;

    if (cycle.end) {
      cycles[i].duration = toDateTime(cycle.end).diff(toDateTime(cycle.start), 'days').days + 1;
    }

    cycles[i].endOfPeriod = getEndOfPeriod(cycle, daysByDate);
  });

  return cycles;
}

const getMean = (data) => {
  return data.reduce(function (a, b) {
    return Number(a) + Number(b);
  }) / data.length;
};

const getSD = (data) => {
  let m = getMean(data);
  return Math.sqrt(data.reduce(function (sq, n) {
    return sq + Math.pow(n - m, 2);
  }, 0) / (data.length - 1));
};

const getShortestCycle = (cycles: Cycle[]): Cycle => {
  return cycles.reduce((prev, current) => {
    return (prev.duration < current.duration) ? prev : current
  });
}

const getLongestCycle = (cycles: Cycle[]): Cycle => {
  return cycles.reduce((prev, current) => {
    return (prev.duration > current.duration) ? prev : current
  });
}

export const getStats = (cycles: Cycle[]): CyclesStats => {
  const durations = cycles.map(cycle => cycle.duration);
  if (!durations.length) {
    return {} as CyclesStats
  }

  return {
    cyclesLength: cycles.length,
    averageCycleLength: Math.round(getMean(durations)),
    standardDeviationCycleLength: Math.round(getSD(durations)),
    shortesCycle: getShortestCycle(cycles),
    longestCycle: getLongestCycle(cycles),
  } as CyclesStats
}

