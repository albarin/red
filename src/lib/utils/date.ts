import { DateTime, Interval } from 'luxon';

export const getMonthCalendarByWeek = (year: number, month: number): Interval[][] => {
  const date = DateTime.fromObject({ year, month });

  const weeks = Interval.fromDateTimes(
    date.startOf('month').startOf('week'),
    date.endOf('month').endOf('week')
  ).splitBy({ weeks: 1 });

  return weeks.map((week) => week.splitBy({ days: 1 }));
}

export const getCurrentMonthCalendar = () => {
  const now = DateTime.now();

  return getMonthCalendarByWeek(now.year, now.month);
}