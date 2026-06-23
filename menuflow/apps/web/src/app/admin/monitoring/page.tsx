'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  restaurant: { name: string };
  customerName?: string;
}

interface Reservation {
  id: string;
  customerName: string;
  guests: number;
  reservationDate: string;
  status: string;
  restaurant: { name: string };
}

export default function AdminMonitoringPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<'orders' | 'reservations'>('orders');

  useEffect(() => {
    Promise.all([
      api.get<Order[]>('/api/admin/monitoring/orders'),
      api.get<Reservation[]>('/api/admin/monitoring/reservations'),
    ]).then(([o, r]) => {
      setOrders(o);
      setReservations(r);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Monitoring</h1>
        <p className="text-gray-400">Activité en temps réel de tous les restaurants</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          Commandes ({orders.length})
        </button>
        <button onClick={() => setTab('reservations')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'reservations' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          Réservations ({reservations.length})
        </button>
      </div>

      <div className="space-y-2">
        {tab === 'orders' && orders.map((o) => (
          <Card key={o.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{o.orderNumber} — {o.restaurant.name}</p>
                <p className="text-sm text-gray-500">{o.customerName || 'Client'} &middot; {formatDate(o.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-emerald-400">{formatCurrency(Number(o.total))}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_LABELS[o.status]?.color || 'bg-gray-800'}`}>
                  {ORDER_STATUS_LABELS[o.status]?.label || o.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {tab === 'reservations' && reservations.map((r) => (
          <Card key={r.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex justify-between">
              <div>
                <p className="font-medium text-white">{r.customerName} — {r.restaurant.name}</p>
                <p className="text-sm text-gray-500">{r.guests} personnes &middot; {formatDate(r.reservationDate)}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">{r.status}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
