'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const [revenue, setRevenue] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: number; orders: number }[]>([]);
  const [retention, setRetention] = useState<{ month: string; newCustomers: number; returning: number }[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    Promise.all([
      api.get(`/api/restaurants/${user.restaurantId}/analytics/revenue?days=30`),
      api.get(`/api/restaurants/${user.restaurantId}/analytics/peak-hours`),
      api.get(`/api/restaurants/${user.restaurantId}/analytics/retention`),
    ]).then(([rev, peak, ret]) => {
      setRevenue(rev as typeof revenue);
      setPeakHours(peak as typeof peakHours);
      setRetention(ret as typeof retention);
    }).catch(console.error);
  }, [user?.restaurantId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500">Analysez les performances de votre restaurant</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenus (30 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Heures de pointe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Rétention clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={retention}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newCustomers" fill="#3b82f6" name="Nouveaux" />
                <Bar dataKey="returning" fill="#10b981" name="Fidèles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
