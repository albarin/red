import { DateTime, Interval } from 'luxon';

export const getMonthCalendarByWeek = (now: DateTime): Interval[][] => {
  const weeks = Interval.fromDateTimes(
    now.startOf('month').startOf('week'),
    now.endOf('month').endOf('week')
  ).splitBy({ weeks: 1 });

  return weeks.map((week) => week.splitBy({ days: 1 }));
}

export const toISOformat = (date: DateTime | Interval | string): string => {
  if (typeof date === 'string') {
    return toISOformat(toDateTime(date));
  }

  if (date instanceof Interval) {
    if (date.start) {
      return date.start?.toFormat('yyyy-MM-dd');
    }
    return '';
  }

  return date.toFormat('yyyy-MM-dd');
}

export const toHumanFormat = (date: DateTime | Interval | string): string => {
  if (typeof date === 'string') {
    return toHumanFormat(toDateTime(date));
  }

  if (date instanceof Interval) {
    if (date.start) {
      return date.start?.toFormat('dd MMMM yyyy');
    }
    return '';
  }

  return date.toFormat('dd MMMM yyyy');
}

export const toDateTime = (date: string): DateTime => {
  return DateTime.fromISO(date);
}