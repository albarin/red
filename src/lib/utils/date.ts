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

export const format = (date: DateTime | Interval): string => {
  if (date instanceof Interval) {
    if (date.start) {
      return date.start?.toFormat('yyyy-MM-dd');
    }
    return '';
  }

  return date.toFormat('yyyy-MM-dd');
}