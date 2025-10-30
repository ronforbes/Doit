import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';

export function formatTaskDate(date: Date | string | null): string {
  if (!date) return 'No date';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';

  return format(dateObj, 'MMM d');
}

export function formatObjectiveDate(startDate: Date | string, targetDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;

  return `${format(start, 'MMM d')} - ${format(target, 'MMM d, yyyy')}`;
}

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isPast(dateObj) && !isToday(dateObj);
}

export function isDueToday(date: Date | string | null): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

export function isDueThisWeek(date: Date | string | null, weekStartsOn: 0 | 1 = 1): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const weekStart = startOfWeek(new Date(), { weekStartsOn });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn });

  return dateObj >= weekStart && dateObj <= weekEnd;
}

export function getTodayDateRange() {
  return {
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  };
}

export function getWeekDateRange(weekStartsOn: 0 | 1 = 1) {
  return {
    start: startOfWeek(new Date(), { weekStartsOn }),
    end: endOfWeek(new Date(), { weekStartsOn }),
  };
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}
