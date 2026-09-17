import { addHours, addMinutes, isPast } from 'date-fns';

export function minutesFromNow(minutes: number): Date {
  return addMinutes(new Date(), minutes);
}

export function hoursFromNow(hours: number): Date {
  return addHours(new Date(), hours);
}

export function isExpired(date: Date | null | undefined): boolean {
  if (!date) return false;
  return isPast(date);
}
