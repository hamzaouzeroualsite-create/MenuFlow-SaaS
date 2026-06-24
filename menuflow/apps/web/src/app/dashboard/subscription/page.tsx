'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getSubscription } from '@/lib/services/data';
import { formatCurrency } from '@/lib/utils';
import type { Subscription } from '@/types';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!user?.restaurantId) return;
    getSubscription(user.restaurantId).then(setSub);
  }, [user?.restaurantId]);

  const plans = [
    { name: 'FREE', price: 0, features: ['Menu digital', '50 produits max', 'QR Code'] },
    { name: 'BASIC', price: 199, features: ['Tout FREE', 'Commandes en ligne', 'Analytics basiques'] },
    { name: 'PREMIUM', price: 499, features: ['Tout BASIC', 'Réservations', 'Analytics avancés', 'Support prioritaire'] },
    { name: 'ENTERPRISE', price: 999, features: ['Tout PREMIUM', 'Multi-établissements', 'API access', 'Account manager'] },
  ];

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Abonnement" />

      {sub && (
        <Card className="border border-emerald-200 bg-emerald-50 shadow-sm rounded-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Plan actuel</p>
              <p className="text-2xl font-bold text-emerald-900">{sub.plan}</p>
              <p className="text-sm text-emerald-600 mt-1">
                Expire le {new Date(sub.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <Badge className="text-base px-4 py-1">{sub.status}</Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`border shadow-sm rounded-xl ${sub?.plan === plan.name ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-100'}`}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">{plan.price === 0 ? 'Gratuit' : formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/mois</span></p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{f}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" variant={sub?.plan === plan.name ? 'outline' : 'default'}>
                {sub?.plan === plan.name ? 'Plan actuel' : 'Mettre à niveau'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
