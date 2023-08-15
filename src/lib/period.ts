import { Cycle } from "./models/cycle";
import type { Day } from "./models/day";
import { byDate, type Days, type Optional } from "./models/models";
import { datesBetween, diffDays, minusDays } from "./utils/date";

export interface CyclesStats {
  cyclesLength: number;
  averageCycleLength: number;
  standardDeviationCycleLength: number;
  shortesCycle: Cycle;
  longestCycle: Cycle;
}

const dayIsStartOfPeriod = (day: Optional<Day>, prevDay: Optional<Day>): boolean => {
  if (!day) {
    return false
  };

  if (!prevDay) {
    return day.hasPeriod();
  }

  return day.hasPeriod() && !prevDay.hasPeriod();
};

const getEndOfPeriod = (cycle: Cycle, days: Days): Optional<string> => {
  if (!cycle.end) {
    return undefined
  };

  const cycleDays = datesBetween(cycle.start, cycle.end)

  for (let i = 1; i < cycleDays.length; i++) {
    const date = cycleDays[i];

    if (!days[date].hasPeriod()) {
      return cycleDays[i - 1];
    }
  }

  return undefined;
}

export const calculateCycles = (days: Day[]): Optional<Cycle[]> => {
  const daysByDate = byDate(days);
  const cycles: Cycle[] = [];

  let date: string = '';
  let prevDate: string = '';

  const dates = datesBetween(days[0].date, days[days.length - 1].date)

  for (let i = 0; i < dates.length; i++) {
    date = dates[i];
    prevDate = dates[i - 1];

    if (dayIsStartOfPeriod(daysByDate[date], daysByDate[prevDate])) {
      cycles.push(new Cycle(cycles.length + 1, date));
    }
  }

  return cycles.map((cycle: Cycle, i: number) => {
    const end = cycles[i + 1] ? minusDays(cycles[i + 1].start, 1) : undefined;
    const duration = end ? diffDays(cycle.start, end) : undefined;
    const endOfPeriod = getEndOfPeriod(cycle, daysByDate);

    return new Cycle(cycle.number, cycle.start, end, endOfPeriod, duration);
  });
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

