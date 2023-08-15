import { Cycle } from "./models/cycle";
import type { Day, Days } from "./models/day";
import type { Optional } from "./models/optional";
import { datesBetween, diffDays, minusDays } from "./utils/date";

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

