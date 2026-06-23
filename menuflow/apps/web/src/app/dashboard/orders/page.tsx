'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ChefHat, X, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { useOrderSocket } from '@/hooks/useSocket';

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  status: string;
  total: number;
  createdAt: string;
  table?: { number: string };
  items: { quantity: number; product: { name: string } }[];
}

const STATUS_FLOW = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'];

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.restaurantId) return;
    try {
      const data = await api.get<Order[]>(`/api/restaurants/${user.restaurantId}/orders?limit=50`);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.restaurantId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onNewOrder = useCallback(() => {
    fetchOrders();
    if (typeof window !== 'undefined' && 'Audio' in window) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch { /* no audio */ }
    }
  }, [fetchOrders]);

  const onOrderUpdate = useCallback(() => { fetchOrders(); }, [fetchOrders]);

  useOrderSocket(user?.restaurantId, onNewOrder, onOrderUpdate);

  const updateStatus = async (orderId: string, status: string) => {
    if (!user?.restaurantId) return;
    try {
      await api.patch(`/api/restaurants/${user.restaurantId}/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const activeOrders = orders.filter((o) => !['SERVED', 'CANCELLED'].includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commandes</h1>
          <p className="text-gray-500">{activeOrders.length} commandes actives</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <Bell className="w-4 h-4 animate-pulse" /> Temps réel actif
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      ) : activeOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune commande active pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {activeOrders.map((order) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100' };
              const nextStatus = getNextStatus(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono font-bold text-lg">{order.orderNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            {order.table && (
                              <span className="text-sm text-gray-500">Table {order.table.number}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {order.customerName || 'Client anonyme'} &middot;{' '}
                            <Clock className="w-3 h-3 inline" /> {formatDate(order.createdAt)}
                          </p>
                          <div className="space-y-1">
                            {order.items.map((item, i) => (
                              <div key={i} className="text-sm flex justify-between">
                                <span>{item.quantity}x {item.product.name}</span>
                              </div>
                            ))}
                          </div>
                          <p className="font-bold text-emerald-600 mt-2">{formatCurrency(Number(order.total))}</p>
                        </div>
                        <div className="flex sm:flex-col gap-2 p-4 bg-gray-50 border-t sm:border-t-0 sm:border-l">
                          {nextStatus && (
                            <Button size="sm" onClick={() => updateStatus(order.id, nextStatus)} className="gap-1">
                              <Check className="w-4 h-4" />
                              {ORDER_STATUS_LABELS[nextStatus]?.label || nextStatus}
                            </Button>
                          )}
                          {order.status === 'PENDING' && (
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, 'CANCELLED')} className="gap-1">
                              <X className="w-4 h-4" /> Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
