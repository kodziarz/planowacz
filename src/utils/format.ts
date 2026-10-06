import type { TFunction } from '@/i18n';

export function formatMinutes(minutes: number, t: TFunction): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return t('duration.minutes', { count: mins });
  if (mins === 0) return t('duration.hours', { count: hours });
  return t('duration.hoursMinutes', { hours, minutes: mins });
}

export function formatDays(days: number, t: TFunction): string {
  return days === 1 ? t('duration.day', { count: days }) : t('duration.days', { count: days });
}

export function formatKm(km: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km);
}

export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}
