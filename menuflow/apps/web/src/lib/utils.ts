import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'MAD'): string {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-MA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Acceptée', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'En préparation', color: 'bg-orange-100 text-orange-800' },
  READY: { label: 'Prête', color: 'bg-emerald-100 text-emerald-800' },
  SERVED: { label: 'Servie', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};
