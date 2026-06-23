'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, ShoppingBag, DollarSign, Users, TrendingUp,
  Clock, Calendar, ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

interface DashboardStats {
  totalScans: number;
  totalOrders: number;
  revenue: number;
  activeCustomers: number;
  conversionRate: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  pendingReservations: number;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [popularProducts, setPopularProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchData = async () => {
      try {
        const [statsData, revenue, products] = await Promise.all([
          api.get<DashboardStats>(`/api/restaurants/${user.restaurantId}/analytics/dashboard`),
          api.get<{ date: string; revenue: number }[]>(`/api/restaurants/${user.restaurantId}/analytics/revenue?days=7`),
          api.get<{ name: string; quantity: number }[]>(`/api/restaurants/${user.restaurantId}/analytics/products`),
        ]);
        setStats(statsData);
        setRevenueData(revenue);
        setPopularProducts(products.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.restaurantId]);

  const statCards = stats ? [
    { title: 'Scans QR', value: stats.totalScans, icon: QrCode, change: '+12%', color: 'text-blue-600 bg-blue-50' },
    { title: 'Commandes', value: stats.totalOrders, icon: ShoppingBag, change: `+${stats.ordersToday} aujourd'hui`, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Revenus', value: formatCurrency(stats.revenue), icon: DollarSign, change: formatCurrency(stats.revenueToday) + ' aujourd\'hui', color: 'text-purple-600 bg-purple-50' },
    { title: 'Clients actifs', value: stats.activeCustomers, icon: Users, change: `${stats.conversionRate}% conversion`, color: 'text-orange-600 bg-orange-50' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bienvenue, {user?.name}. Voici un aperçu de votre restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {stats && (stats.pendingOrders > 0 || stats.pendingReservations > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingOrders > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">{stats.pendingOrders} commandes en attente</p>
                  <p className="text-sm text-orange-600">Nécessitent votre attention</p>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.pendingReservations > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">{stats.pendingReservations} réservations en attente</p>
                  <p className="text-sm text-blue-600">À confirmer</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenus (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenus']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produits populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
