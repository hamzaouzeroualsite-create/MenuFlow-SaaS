import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { AppError } from '../utils/response';
import { UserRole, SubscriptionPlan } from '@menuflow/shared';
import { slugify } from './auth.service';

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

export async function getPlatformDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRestaurants,
    activeRestaurants,
    suspendedRestaurants,
    totalUsers,
    totalOrders,
    totalRevenue,
    monthlyRevenue,
    recentRestaurants,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { status: 'ACTIVE' } }),
    prisma.restaurant.count({ where: { status: 'SUSPENDED' } }),
    prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { not: 'CANCELLED' },
        paymentStatus: 'PAID',
        createdAt: { gte: monthStart },
      },
      _sum: { total: true },
    }),
    prisma.restaurant.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const growthData = await prisma.$queryRaw<{ month: string; count: number }[]>`
    SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::int as count
    FROM "Restaurant"
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
    LIMIT 12
  `;

  const revenueByMonth = await prisma.$queryRaw<{ month: string; revenue: number }[]>`
    SELECT TO_CHAR("createdAt", 'YYYY-MM') as month,
           COALESCE(SUM(total), 0)::float as revenue
    FROM "Order"
    WHERE status != 'CANCELLED' AND "paymentStatus" = 'PAID'
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
    ORDER BY month ASC
    LIMIT 12
  `;

  return {
    totalRestaurants,
    activeRestaurants,
    suspendedRestaurants,
    totalUsers,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
    newRestaurantsThisMonth: recentRestaurants,
    growthChart: growthData.map((d) => ({ month: d.month, restaurants: Number(d.count) })),
    revenueChart: revenueByMonth.map((d) => ({ month: d.month, revenue: Number(d.revenue) })),
  };
}

export async function listRestaurants(filters: {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  plan?: string;
  status?: string;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = {
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { email: { contains: filters.search, mode: 'insensitive' as const } },
        { slug: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(filters.city && { city: { equals: filters.city, mode: 'insensitive' as const } }),
    ...(filters.plan && { subscriptionPlan: filters.plan as SubscriptionPlan }),
    ...(filters.status && { status: filters.status as 'ACTIVE' | 'SUSPENDED' }),
  };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: {
        _count: { select: { users: true, orders: true, products: true } },
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        users: {
          where: { role: 'RESTAURANT_OWNER' },
          select: { id: true, name: true, email: true },
          take: 1,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { restaurants, total, page, limit };
}

export async function createRestaurant(data: {
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  subscriptionPlan?: SubscriptionPlan;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
  onboardedBy: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.ownerEmail } });
  if (existing) throw new AppError('Cet email propriétaire est déjà utilisé', 409);

  let slug = slugify(data.name);
  const slugExists = await prisma.restaurant.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const hashedPassword = await bcrypt.hash(data.ownerPassword, 12);
  const plan = data.subscriptionPlan || SubscriptionPlan.FREE;

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.name,
        slug,
        city: data.city,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
        subscriptionPlan: plan,
        status: 'ACTIVE',
        onboardedBy: data.onboardedBy,
        settings: {
          theme: { primaryColor: '#10B981', secondaryColor: '#FFFFFF', accentColor: '#1F2937' },
          languages: ['fr', 'ar', 'en'],
          defaultLanguage: 'fr',
          taxes: [{ name: 'TVA', rate: 10 }],
          deliveryFee: 0,
          notifications: { email: true, sms: false, push: true, sound: true },
        },
      },
    });

    const owner = await tx.user.create({
      data: {
        name: data.ownerName,
        email: data.ownerEmail,
        password: hashedPassword,
        phone: data.ownerPhone,
        role: 'RESTAURANT_OWNER',
        restaurantId: restaurant.id,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await tx.subscription.create({
      data: {
        restaurantId: restaurant.id,
        plan,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return { restaurant, owner };
  });
}

export async function updateRestaurantAdmin(id: string, data: Record<string, unknown>) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);
  return prisma.restaurant.update({ where: { id }, data: data as Parameters<typeof prisma.restaurant.update>[0]['data'] });
}

export async function suspendRestaurant(id: string, reason?: string, adminId?: string) {
  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendedReason: reason, isActive: false },
  });
  await prisma.adminNotification.create({
    data: {
      type: 'WARNING',
      title: 'Restaurant suspendu',
      message: `${restaurant.name} a été suspendu${reason ? `: ${reason}` : ''}`,
      metadata: { restaurantId: id, adminId },
    },
  });
  return restaurant;
}

export async function activateRestaurant(id: string, adminId?: string) {
  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { status: 'ACTIVE', suspendedAt: null, suspendedReason: null, isActive: true },
  });
  await prisma.adminNotification.create({
    data: {
      type: 'SUCCESS',
      title: 'Restaurant activé',
      message: `${restaurant.name} a été réactivé`,
      metadata: { restaurantId: id, adminId },
    },
  });
  return restaurant;
}

export async function deleteRestaurant(id: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);
  await prisma.restaurant.delete({ where: { id } });
  return { deleted: true, name: restaurant.name };
}

export async function getRestaurantAnalytics(id: string) {
  const [orders, revenue, products, customers, scans] = await Promise.all([
    prisma.order.count({ where: { restaurantId: id, status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({
      where: { restaurantId: id, status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { restaurantId: id } }),
    prisma.customer.count({ where: { restaurantId: id } }),
    prisma.qrScan.count({ where: { restaurantId: id } }),
  ]);
  return {
    orders,
    revenue: Number(revenue._sum.total || 0),
    products,
    customers,
    scans,
  };
}

export async function listUsers(filters: { page?: number; limit?: number; search?: string; role?: string }) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = {
    role: { not: 'SUPER_ADMIN' as const },
    ...(filters.role && { role: filters.role as 'RESTAURANT_OWNER' }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' as const } },
        { email: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isActive: true, restaurantId: true, createdAt: true, lastLoginAt: true,
        restaurant: { select: { id: true, name: true, status: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export async function createRestaurantOwner(data: {
  restaurantId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email déjà utilisé', 409);

  const hashedPassword = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: 'RESTAURANT_OWNER',
    },
    select: { id: true, name: true, email: true, role: true, restaurantId: true },
  });
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  if (user.role === 'SUPER_ADMIN') throw new AppError('Impossible de réinitialiser un Super Admin', 403);

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  if (user.role === 'SUPER_ADMIN') throw new AppError('Action non autorisée', 403);
  return prisma.user.update({ where: { id: userId }, data: { isActive } });
}

export async function impersonateUser(targetUserId: string, adminUserId: string) {
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { restaurant: { select: { id: true, name: true, slug: true, logo: true, subscriptionPlan: true, status: true } } },
  });
  if (!target || !target.isActive) throw new AppError('Utilisateur non trouvé', 404);
  if (target.role === 'SUPER_ADMIN') throw new AppError('Impersonation non autorisée', 403);

  const accessToken = signAccessToken({
    userId: target.id,
    email: target.email,
    role: target.role as UserRole,
    restaurantId: target.restaurantId || undefined,
    impersonatedBy: adminUserId,
  });

  const refreshToken = signRefreshToken({ userId: target.id });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: target.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const { password: _, ...safeUser } = target;
  return { accessToken, refreshToken, user: safeUser, impersonated: true };
}

export async function listSubscriptions(filters: { page?: number; limit?: number; status?: string }) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = filters.status ? { status: filters.status as 'ACTIVE' } : {};

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { restaurant: { select: { id: true, name: true, city: true, status: true } } },
      orderBy: { endDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subscription.count({ where }),
  ]);

  return { subscriptions, total, page, limit };
}

export async function updateSubscription(id: string, data: {
  plan?: SubscriptionPlan;
  status?: string;
  endDate?: string;
}) {
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) throw new AppError('Abonnement non trouvé', 404);

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      ...(data.plan && { plan: data.plan }),
      ...(data.status && { status: data.status as 'ACTIVE' }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
  });

  if (data.plan) {
    await prisma.restaurant.update({
      where: { id: sub.restaurantId },
      data: { subscriptionPlan: data.plan },
    });
  }

  return updated;
}

export async function expireSubscriptions() {
  const expired = await prisma.subscription.updateMany({
    where: { endDate: { lt: new Date() }, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  });
  return { expired: expired.count };
}

export async function getMonitoringOrders(page = 1, limit = 30) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        restaurant: { select: { id: true, name: true } },
        table: { select: { number: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count(),
  ]);
  return { orders, total, page, limit };
}

export async function getMonitoringReservations(page = 1, limit = 30) {
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      include: { restaurant: { select: { id: true, name: true } } },
      orderBy: { reservationDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reservation.count(),
  ]);
  return { reservations, total, page, limit };
}

export async function getAuditLogs(filters: { page?: number; limit?: number; action?: string; entity?: string }) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const where = {
    ...(filters.action && { action: { contains: filters.action } }),
    ...(filters.entity && { entity: filters.entity }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit };
}

export async function getLoginHistory(page = 1, limit = 50) {
  const [history, total] = await Promise.all([
    prisma.loginHistory.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.loginHistory.count(),
  ]);
  return { history, total, page, limit };
}

export async function createBackup(type: 'AUTOMATIC' | 'MANUAL', createdBy?: string) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const backup = await prisma.backup.create({
    data: { type, status: 'PENDING', createdBy },
  });

  try {
    const [restaurants, users, orders] = await Promise.all([
      prisma.restaurant.findMany({ include: { subscriptions: true } }),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, restaurantId: true, createdAt: true } }),
      prisma.order.findMany({ take: 10000, orderBy: { createdAt: 'desc' } }),
    ]);

    const payload = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      restaurants,
      users,
      ordersCount: orders.length,
      orders: orders.slice(0, 1000),
    };

    const filename = `backup-${backup.id}-${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    const stats = fs.statSync(filePath);

    const completed = await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: 'COMPLETED',
        filePath: filename,
        fileSize: stats.size,
        completedAt: new Date(),
        metadata: { restaurants: restaurants.length, users: users.length },
      },
    });

    return completed;
  } catch (error) {
    await prisma.backup.update({
      where: { id: backup.id },
      data: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
    });
    throw error;
  }
}

export async function listBackups(page = 1, limit = 20) {
  const [backups, total] = await Promise.all([
    prisma.backup.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.backup.count(),
  ]);
  return { backups, total, page, limit };
}

export async function getPlatformSettings() {
  let settings = await prisma.platformSettings.findUnique({ where: { id: 'platform' } });
  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: {
        id: 'platform',
        settings: {
          platformName: 'MenuFlow',
          supportEmail: 'support@menuflow.ma',
          defaultCurrency: 'MAD',
          autoBackupEnabled: true,
          autoBackupHour: 2,
          maintenanceMode: false,
        },
      },
    });
  }
  return settings;
}

export async function updatePlatformSettings(settings: Record<string, unknown>, updatedBy: string) {
  return prisma.platformSettings.upsert({
    where: { id: 'platform' },
    create: { id: 'platform', settings, updatedBy },
    update: { settings, updatedBy },
  });
}

export async function getAdminNotifications(unreadOnly = false) {
  return prisma.adminNotification.findMany({
    where: unreadOnly ? { read: false } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.adminNotification.update({ where: { id }, data: { read: true } });
}
