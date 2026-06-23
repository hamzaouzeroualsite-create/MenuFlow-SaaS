'use client';

import { useEffect, useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const currentPlan = user?.restaurant?.subscriptionPlan || 'FREE';

  useEffect(() => {
    api.get<Plan[]>('/api/subscriptions/plans').then(setPlans).catch(console.error);
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      const result = await api.post<{ url: string }>('/api/subscriptions/checkout', { plan: planId });
      if (result.url) window.location.href = result.url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abonnement</h1>
        <p className="text-gray-500">Plan actuel : <span className="font-medium text-emerald-600">{currentPlan}</span></p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === currentPlan ? 'border-emerald-500 border-2' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500"> MAD/mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-600" /> {f}
                  </li>
                ))}
              </ul>
              {plan.id === currentPlan ? (
                <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
              ) : (
                <Button className="w-full gap-1" onClick={() => handleUpgrade(plan.id)}>
                  <CreditCard className="w-4 h-4" />
                  {plan.price === 0 ? 'Rétrograder' : 'Choisir'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
