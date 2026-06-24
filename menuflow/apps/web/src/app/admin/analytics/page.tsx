'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformStats, getVisitsChartData } from '@/lib/services/data';
import { useEffect, useState } from 'react';
import type { PlatformStats } from '@/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const chartData = getVisitsChartData();

  useEffect(() => { getPlatformStats().then(setStats); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics Plateforme</h1>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Restaurants actifs', value: stats.activeRestaurants },
            { label: 'Commandes totales', value: stats.totalOrders },
            { label: 'Abonnements', value: stats.activeSubscriptions },
            { label: 'Nouveaux ce mois', value: stats.newRestaurantsThisMonth },
          ].map((s) => (
            <Card key={s.label} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader><CardTitle className="text-white text-base">Croissance abonnements</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => v.slice(8)} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
