'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, ShoppingBag, DollarSign, TrendingUp, PauseCircle, CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  suspendedRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newRestaurantsThisMonth: number;
  growthChart: { month: string; restaurants: number }[];
  revenueChart: { month: string; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PlatformStats>('/api/admin/dashboard')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = stats ? [
    { title: 'Restaurants', value: stats.totalRestaurants, sub: `${stats.activeRestaurants} actifs`, icon: Building2, color: 'text-emerald-400' },
    { title: 'Suspendus', value: stats.suspendedRestaurants, sub: 'Comptes bloqués', icon: PauseCircle, color: 'text-red-400' },
    { title: 'Utilisateurs', value: stats.totalUsers, sub: 'Hors super admin', icon: Users, color: 'text-blue-400' },
    { title: 'Commandes', value: stats.totalOrders, sub: 'Plateforme totale', icon: ShoppingBag, color: 'text-purple-400' },
    { title: 'Revenus totaux', value: formatCurrency(stats.totalRevenue), sub: formatCurrency(stats.monthlyRevenue) + ' ce mois', icon: DollarSign, color: 'text-yellow-400' },
    { title: 'Nouveaux', value: stats.newRestaurantsThisMonth, sub: 'Ce mois-ci', icon: TrendingUp, color: 'text-emerald-400' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Plateforme</h1>
        <p className="text-gray-400">Vue d&apos;ensemble MenuFlow — gestion centralisée</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Croissance restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.growthChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1F2937', border: 'none' }} />
                <Bar dataKey="restaurants" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Revenus plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1F2937', border: 'none' }} formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
