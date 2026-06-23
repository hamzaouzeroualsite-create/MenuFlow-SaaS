'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface SuperAdminStats {
  totalRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  subscriptionsByPlan: { plan: string; count: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }
    api.get<SuperAdminStats>('/api/restaurants/placeholder/analytics/super-admin')
      .then(setStats)
      .catch(console.error);
  }, [user, router]);

  const statCards = stats ? [
    { title: 'Restaurants', value: stats.totalRestaurants, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { title: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Commandes', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
    { title: 'Revenus', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-orange-600 bg-orange-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          <p className="text-gray-500">Gestion de la plateforme MenuFlow</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats?.subscriptionsByPlan && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Abonnements par plan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.subscriptionsByPlan.map((s) => (
                  <div key={s.plan} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{s.count}</p>
                    <p className="text-sm text-gray-500">{s.plan}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
