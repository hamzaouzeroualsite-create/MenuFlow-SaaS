import { prisma } from '../lib/prisma';

export async function getDashboardStats(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    ordersToday,
    revenueResult,
    revenueTodayResult,
    activeCustomers,
    totalScans,
    pendingOrders,
    pendingReservations,
  ] = await Promise.all([
    prisma.order.count({ where: { restaurantId, status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { restaurantId, createdAt: { gte: today }, status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({
      where: { restaurantId, status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { restaurantId, createdAt: { gte: today }, status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.customer.count({ where: { restaurantId, totalOrders: { gt: 0 } } }),
    prisma.qrScan.count({ where: { restaurantId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.count({ where: { restaurantId, status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] } } }),
    prisma.reservation.count({ where: { restaurantId, status: 'PENDING' } }),
  ]);

  const revenue = Number(revenueResult._sum.total || 0);
  const revenueToday = Number(revenueTodayResult._sum.total || 0);
  const conversionRate = totalScans > 0 ? (totalOrders / totalScans) * 100 : 0;

  return {
    totalScans,
    totalOrders,
    revenue,
    activeCustomers,
    conversionRate: Math.round(conversionRate * 100) / 100,
    ordersToday,
    revenueToday,
    pendingOrders,
    pendingReservations,
  };
}

export async function getRevenueChart(restaurantId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await prisma.$queryRaw<{ date: Date; revenue: number; orders: number }[]>`
    SELECT DATE("createdAt") as date,
           COALESCE(SUM(total), 0)::float as revenue,
           COUNT(*)::int as orders
    FROM "Order"
    WHERE "restaurantId" = ${restaurantId}
      AND "createdAt" >= ${since}
      AND status != 'CANCELLED'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  return data.map((d) => ({
    date: d.date.toISOString().split('T')[0],
    revenue: Number(d.revenue),
    orders: Number(d.orders),
  }));
}

export async function getPopularProducts(restaurantId: string, limit = 10) {
  const products = await prisma.$queryRaw<{ id: string; name: string; quantity: number; revenue: number }[]>`
    SELECT p.id, p.name,
           SUM(oi.quantity)::int as quantity,
           SUM(oi.price * oi.quantity)::float as revenue
    FROM "OrderItem" oi
    JOIN "Product" p ON p.id = oi."productId"
    JOIN "Order" o ON o.id = oi."orderId"
    WHERE o."restaurantId" = ${restaurantId} AND o.status != 'CANCELLED'
    GROUP BY p.id, p.name
    ORDER BY quantity DESC
    LIMIT ${limit}
  `;

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    quantity: Number(p.quantity),
    revenue: Number(p.revenue),
  }));
}

export async function getPeakHours(restaurantId: string) {
  const data = await prisma.$queryRaw<{ hour: number; orders: number }[]>`
    SELECT EXTRACT(HOUR FROM "createdAt")::int as hour,
           COUNT(*)::int as orders
    FROM "Order"
    WHERE "restaurantId" = ${restaurantId} AND status != 'CANCELLED'
    GROUP BY EXTRACT(HOUR FROM "createdAt")
    ORDER BY hour ASC
  `;

  return data.map((d) => ({ hour: Number(d.hour), orders: Number(d.orders) }));
}

export async function getCustomerRetention(restaurantId: string) {
  const data = await prisma.$queryRaw<{ month: string; new_customers: number; returning: number }[]>`
    SELECT TO_CHAR("createdAt", 'YYYY-MM') as month,
           COUNT(*) FILTER (WHERE "totalOrders" = 1)::int as new_customers,
           COUNT(*) FILTER (WHERE "totalOrders" > 1)::int as returning
    FROM "Customer"
    WHERE "restaurantId" = ${restaurantId}
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
    LIMIT 12
  `;

  return data.map((d) => ({
    month: d.month,
    newCustomers: Number(d.new_customers),
    returning: Number(d.returning),
  }));
}

export async function getSuperAdminStats() {
  const [restaurants, users, orders, revenue] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
  ]);

  const subscriptions = await prisma.restaurant.groupBy({
    by: ['subscriptionPlan'],
    _count: true,
  });

  return {
    totalRestaurants: restaurants,
    totalUsers: users,
    totalOrders: orders,
    totalRevenue: Number(revenue._sum.total || 0),
    subscriptionsByPlan: subscriptions.map((s) => ({
      plan: s.subscriptionPlan,
      count: s._count,
    })),
  };
}
