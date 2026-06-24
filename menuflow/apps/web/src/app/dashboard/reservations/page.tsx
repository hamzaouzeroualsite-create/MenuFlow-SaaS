'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getReservations, updateReservationStatus } from '@/lib/services/data';
import type { Reservation } from '@/types';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    getReservations(user.restaurantId).then(setReservations);
  }, [user?.restaurantId]);

  const statusVariant = (s: string) => {
    if (s === 'CONFIRMED') return 'default';
    if (s === 'PENDING') return 'pending';
    if (s === 'REJECTED') return 'cancelled';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Réservations" />

      <div className="grid gap-4">
        {reservations.map((res, i) => (
          <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border border-gray-100 shadow-sm rounded-xl">
              <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{res.customerName}</h3>
                    <Badge variant={statusVariant(res.status) as 'default'}>{res.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {res.date} à {res.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {res.guests} personnes</span>
                    <span>{res.customerPhone}</span>
                  </div>
                  {res.notes && <p className="text-sm text-gray-400 mt-2 italic">{res.notes}</p>}
                </div>
                {res.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateReservationStatus(res.id, 'CONFIRMED')}>
                      <Check className="w-4 h-4 mr-1" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateReservationStatus(res.id, 'REJECTED')}>
                      <X className="w-4 h-4 mr-1" /> Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
