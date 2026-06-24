'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ShoppingBag, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformStats, getVisitsChartData } from '@/lib/services/data';
import { formatCurrency } from '@/lib/utils';
import type { PlatformStats } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const chartData = getVisitsChartData();

  useEffect(() => {
    getPlatformStats().then(setStats);
  }, []);

  const cards = stats ? [
    { title: 'Restaurants', value: stats.totalRestaurants, sub: `${stats.activeRestaurants} actifs`, icon: Building2, color: 'text-blue-400 bg-blue-400/10' },
    { title: 'Commandes totales', value: stats.totalOrders.toLocaleString('fr-FR'), sub: `+${stats.newRestaurantsThisMonth} ce mois`, icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-400/10' },
    { title: 'Revenus plateforme', value: formatCurrency(stats.totalRevenue), sub: 'Tous restaurants', icon: DollarSign, color: 'text-amber-400 bg-amber-400/10' },
    { title: 'Abonnements actifs', value: stats.activeSubscriptions, sub: 'Premium & Basic', icon: CreditCard, color: 'text-purple-400 bg-purple-400/10' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Vue d&apos;ensemble de la plateforme MenuFlow</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{card.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Croissance des revenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => v.slice(8)} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
