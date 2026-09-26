import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(isoString: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 10) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatAbsoluteDateTime(isoString: string): { utc: string; ict: string } {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { utc: 'N/A', ict: 'N/A' };
  const utc = d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const ictMs = d.getTime() + 7 * 3600000;
  const ictDate = new Date(ictMs);
  const ict = ictDate.toISOString().replace('T', ' ').slice(0, 19) + ' ICT';
  return { utc, ict };
}

export function formatDateTimeByTimezone(isoString: string, timezone: 'ICT' | 'UTC'): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '---';
  if (timezone === 'UTC') {
    return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }
  const ictMs = d.getTime() + 7 * 3600000;
  const ictDate = new Date(ictMs);
  return ictDate.toISOString().replace('T', ' ').slice(0, 16) + ' ICT';
}

