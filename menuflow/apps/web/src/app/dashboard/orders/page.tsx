'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { subscribeToOrders, updateOrderStatus } from '@/lib/services/data';
import { getOrderStatusBadge, formatTimeAgo } from '@/lib/order-utils';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const statusFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    return subscribeToOrders(user.restaurantId, setOrders);
  }, [user?.restaurantId]);

  const handleStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Commandes" />

      <div className="grid gap-4">
        {orders.map((order, i) => {
          const badge = getOrderStatusBadge(order.status);
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border border-gray-100 shadow-sm rounded-xl">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.orderNumber}</h3>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        {order.tableNumber && <span className="text-sm text-gray-500">Table {order.tableNumber}</span>}
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, j) => (
                          <p key={j} className="text-sm text-gray-600">{item.quantity}x {item.name} — {formatCurrency(item.price * item.quantity)}</p>
                        ))}
                      </div>
                      {order.notes && <p className="text-sm text-gray-400 mt-2 italic">&quot;{order.notes}&quot;</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(order.createdAt)}</p>
                      <div className="flex gap-2 mt-2">
                        {order.status === 'PENDING' && (
                          <>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatus(order.id, 'CONFIRMED')}>
                              <Check className="w-4 h-4 mr-1" /> Accepter
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleStatus(order.id, 'CANCELLED')}>
                              <X className="w-4 h-4 mr-1" /> Refuser
                            </Button>
                          </>
                        )}
                        {order.status !== 'PENDING' && order.status !== 'SERVED' && order.status !== 'CANCELLED' && (
                          <Button size="sm" variant="outline" onClick={() => {
                            const idx = statusFlow.indexOf(order.status);
                            if (idx < statusFlow.length - 1) handleStatus(order.id, statusFlow[idx + 1]);
                          }}>
                            Étape suivante
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
