'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Eye, ShoppingBag, DollarSign, Users, TrendingUp,
  Download, Printer, Share2, ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  getDashboardStats, getOrders, getVisitsChartData, getOrderDistribution,
  getPopularDishes, getSubscription,
} from '@/lib/services/data';
import { getOrderStatusBadge, formatOrderTime } from '@/lib/order-utils';
import { generateQRCodeDataUrl, getMenuUrl, downloadQRPNG, printQRCode, shareQRCode } from '@/lib/qr';
import type { DashboardStats, Order, Subscription } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function DashboardPage() {
  const { user, restaurant } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const visitsData = getVisitsChartData();
  const orderDistribution = getOrderDistribution();
  const popularDishes = restaurant ? getPopularDishes(restaurant.id) : [];

  useEffect(() => {
    if (!user?.restaurantId) return;
    (async () => {
      const [s, o, sub] = await Promise.all([
        getDashboardStats(user.restaurantId!),
        getOrders(user.restaurantId!),
        getSubscription(user.restaurantId!),
      ]);
      setStats(s);
      setOrders(o.slice(0, 5));
      setSubscription(sub);
      if (restaurant) {
        const url = getMenuUrl(restaurant.slug);
        setQrDataUrl(await generateQRCodeDataUrl(url, 180));
      }
      setLoading(false);
    })();
  }, [user?.restaurantId, restaurant]);

  const statCards = stats ? [
    { title: 'Scans QR', value: stats.qrScans.toLocaleString('fr-FR'), growth: stats.qrScansGrowth, icon: QrCode, color: 'bg-blue-50 text-blue-600' },
    { title: 'Visites Menu', value: stats.menuVisits.toLocaleString('fr-FR'), growth: stats.menuVisitsGrowth, icon: Eye, color: 'bg-purple-50 text-purple-600' },
    { title: 'Commandes', value: stats.orders.toLocaleString('fr-FR'), growth: stats.ordersGrowth, icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Revenus', value: formatCurrency(stats.revenue), growth: stats.revenueGrowth, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
    { title: 'Clients uniques', value: stats.uniqueCustomers.toLocaleString('fr-FR'), growth: stats.customersGrowth, icon: Users, color: 'bg-rose-50 text-rose-600' },
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
      <RestaurantHeader title="Tableau de bord" />

      {/* Date range picker placeholder */}
      <div className="hidden lg:flex justify-end -mt-2 mb-2">
        <div className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2">
          1 Mai 2024 — 31 Mai 2024
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border border-gray-100 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-0.5 font-medium">
                      <ArrowUpRight className="w-3 h-3" /> +{stat.growth}%
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Visites Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={visitsData}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(8)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#10B981" fill="url(#visitGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Répartition des commandes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {orderDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((order) => {
              const badge = getOrderStatusBadge(order.status);
              const itemsSummary = order.items.map((i) => `${i.quantity} ${i.name}`).join(', ');
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.tableNumber ? `Table ${order.tableNumber}, ` : ''}{itemsSummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-xs text-gray-400">{formatOrderTime(order.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Plats populaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularDishes.map((dish, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {dish.image && <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dish.name}</p>
                  <p className="text-xs text-gray-500">{dish.orders} commandes</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" /> QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 rounded-lg border border-gray-100" />
            )}
            <div className="flex gap-2 mt-4 w-full">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => restaurant && downloadQRPNG(getMenuUrl(restaurant.slug), 'qrcode.png')}>
                <Download className="w-3.5 h-3.5 mr-1" /> Télécharger
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => qrDataUrl && printQRCode(qrDataUrl, restaurant?.name || 'QR')}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => restaurant && shareQRCode(getMenuUrl(restaurant.slug), restaurant.name)}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Partager
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Plan actuel</span>
                <Badge>{subscription?.plan || 'PREMIUM'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Expiration</span>
                <span className="text-sm font-medium">
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('fr-FR')
                    : '31 déc. 2026'}
                </span>
              </div>
              <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
                Gérer l&apos;abonnement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
