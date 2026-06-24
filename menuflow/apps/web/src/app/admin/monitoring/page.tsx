'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllOrders, getAllReservations } from '@/lib/services/data';
import { formatCurrency } from '@/lib/utils';
import type { Order, Reservation } from '@/types';

export default function AdminMonitoringPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    Promise.all([getAllOrders(), getAllReservations()]).then(([o, r]) => {
      setOrders(o.slice(0, 20));
      setReservations(r);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Monitoring</h1>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Commandes récentes (toutes plateformes)</h2>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">Restaurant: {o.restaurantId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{o.status}</Badge>
                  <span className="text-emerald-400 text-sm font-medium">{formatCurrency(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Réservations</h2>
          <div className="space-y-2">
            {reservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-white">{r.customerName} — {r.guests} pers.</p>
                  <p className="text-xs text-gray-500">{r.date} à {r.time}</p>
                </div>
                <Badge>{r.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
