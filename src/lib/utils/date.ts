import { format, formatDistanceToNow, isAfter, isBefore, isWithinInterval } from 'date-fns'

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isWidgetActive(startAt?: Date | null, endAt?: Date | null): boolean {
  const now = new Date()
  
  if (startAt && isBefore(now, new Date(startAt))) {
    return false
  }
  
  if (endAt && isAfter(now, new Date(endAt))) {
    return false
  }
  
  return true
}

export function getWidgetScheduleStatus(
  startAt?: Date | null,
  endAt?: Date | null
): 'scheduled' | 'active' | 'expired' | 'always' {
  if (!startAt && !endAt) return 'always'
  
  const now = new Date()
  
  if (startAt && isBefore(now, new Date(startAt))) {
    return 'scheduled'
  }
  
  if (endAt && isAfter(now, new Date(endAt))) {
    return 'expired'
  }
  
  return 'active'
}