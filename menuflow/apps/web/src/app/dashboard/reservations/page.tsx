'use client';

import { useEffect, useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  reservationDate: string;
  status: string;
  notes?: string;
}

export default function ReservationsPage() {
  const user = useAuthStore((s) => s.user);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get<Reservation[]>(`/api/restaurants/${user.restaurantId}/reservations`)
      .then(setReservations)
      .catch(console.error);
  }, [user?.restaurantId]);

  const updateStatus = async (id: string, status: string) => {
    if (!user?.restaurantId) return;
    await api.patch(`/api/restaurants/${user.restaurantId}/reservations/${id}/status`, { status });
    setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const pending = reservations.filter((r) => r.status === 'PENDING');
  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-gray-500">{pending.length} en attente de confirmation</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-orange-600">En attente</h2>
          {pending.map((r) => (
            <Card key={r.id} className="border-orange-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {r.guests} personnes &middot; {formatDate(r.reservationDate)} &middot; {r.phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(r.id, 'CONFIRMED')} className="gap-1">
                    <Check className="w-4 h-4" /> Confirmer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(r.id, 'CANCELLED')} className="gap-1">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> Confirmées</h2>
        {confirmed.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <p className="font-medium">{r.customerName}</p>
              <p className="text-sm text-gray-500">{r.guests} personnes &middot; {formatDate(r.reservationDate)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
