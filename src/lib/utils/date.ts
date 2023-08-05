import { DateTime, Interval } from 'luxon';

export const getMonthCalendarByWeek = (now: DateTime): Interval[][] => {
  const weeks = Interval.fromDateTimes(
    now.startOf('month').startOf('week'),
    now.endOf('month').endOf('week')
  ).splitBy({ weeks: 1 });

  return weeks.map((week) => week.splitBy({ days: 1 }));
}

export const toISOformat = (date: DateTime | Interval): string => {
  if (date instanceof Interval) {
    if (date.start) {
      return date.start?.toFormat('yyyy-MM-dd');
    }
    return '';
  }

  return date.toFormat('yyyy-MM-dd');
}

export const toDateTime = (date: string): DateTime => {
  return DateTime.fromISO(date);
}