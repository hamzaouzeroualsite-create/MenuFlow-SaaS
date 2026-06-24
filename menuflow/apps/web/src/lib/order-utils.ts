import type { OrderStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/badge';

const statusMap: Record<OrderStatus, { label: string; variant: BadgeProps['variant'] }> = {
  PENDING: { label: 'En attente', variant: 'pending' },
  CONFIRMED: { label: 'Confirmée', variant: 'secondary' },
  PREPARING: { label: 'En préparation', variant: 'preparing' },
  READY: { label: 'Prête', variant: 'ready' },
  SERVED: { label: 'Servie', variant: 'served' },
  CANCELLED: { label: 'Annulée', variant: 'cancelled' },
};

export function getOrderStatusBadge(status: OrderStatus) {
  return statusMap[status] ?? { label: status, variant: 'secondary' as const };
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export function formatOrderTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
