import { format, differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn));
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function propertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    APARTMENT: 'Apartment',
    HOUSE: 'House',
    VILLA: 'Villa',
    CONDO: 'Condo',
    COTTAGE: 'Cottage',
    STUDIO: 'Studio',
    LOFT: 'Loft',
    CABIN: 'Cabin',
    OTHER: 'Other',
  };
  return map[type] ?? type;
}

export function bookingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
  };
  return map[status] ?? status;
}
