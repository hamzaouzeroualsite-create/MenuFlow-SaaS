'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  restaurant: { id: string; name: string; city?: string; status: string };
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    api.get<Subscription[]>('/api/admin/subscriptions').then(setSubscriptions).catch(console.error);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/subscriptions/${id}`, { status });
    setSubscriptions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };

  const updatePlan = async (id: string, plan: string) => {
    await api.put(`/api/admin/subscriptions/${id}`, { plan });
    setSubscriptions((prev) => prev.map((s) => s.id === id ? { ...s, plan } : s));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Abonnements</h1>
        <p className="text-gray-400">Gestion des plans et expirations</p>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{sub.restaurant.name}</p>
                <p className="text-sm text-gray-500">
                  {sub.plan} &middot; {sub.status} &middot; Expire: {sub.endDate ? formatDate(sub.endDate) : '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <select className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-white text-sm" value={sub.plan} onChange={(e) => updatePlan(sub.id, e.target.value)}>
                  {['FREE', 'STARTER', 'PREMIUM', 'ENTERPRISE'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-white text-sm" value={sub.status} onChange={(e) => updateStatus(sub.id, e.target.value)}>
                  {['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
