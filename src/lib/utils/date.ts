import { DateTime, Interval } from 'luxon';

export const now = (): DateTime => {
  return DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
}

export const getMonthCalendarByWeek = (now: DateTime): Interval[][] => {
  const weeks = Interval.fromDateTimes(
    now.startOf('month').startOf('week'),
    now.endOf('month').endOf('week')
  ).splitBy({ weeks: 1 });

  return weeks.map((week) => week.splitBy({ days: 1 }));
}

export const iso = (date: DateTime | Interval | string): string => {
  if (typeof date === 'string') {
    return iso(toDateTime(date));
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

export const isToday = (day: DateTime | Interval): boolean => {
  if (day instanceof Interval) {
    if (day.start) {
      return isToday(day.start);
    }
    return false;
  }

  return day.equals(now());
};

export const isPast = (date: DateTime | Interval): boolean => {
  if (date instanceof Interval) {
    if (date.start) {
      return isPast(date.start);
    }
    return false;
  }

  return date < now();
}

export const isFuture = (date: DateTime | Interval): boolean => {
  if (date instanceof Interval) {
    if (date.start) {
      return isFuture(date.start);
    }
    return false;
  }

  return date > now();
}