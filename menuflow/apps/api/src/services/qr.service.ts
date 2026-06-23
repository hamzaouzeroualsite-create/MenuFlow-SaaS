import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateRestaurantQR(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);

  const menuUrl = `${APP_URL}/menu/${restaurant.slug}`;
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 512,
    margin: 2,
    color: { dark: '#10B981', light: '#FFFFFF' },
  });

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { qrCodeUrl: qrDataUrl },
  });

  return { url: menuUrl, qrCode: qrDataUrl };
}

export async function generateTableQR(restaurantId: string, tableId: string) {
  const table = await prisma.table.findFirst({
    where: { id: tableId, restaurantId },
    include: { restaurant: { select: { slug: true } } },
  });
  if (!table) throw new AppError('Table non trouvée', 404);

  const menuUrl = `${APP_URL}/menu/${table.restaurant.slug}?table=${table.number}`;
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 512,
    margin: 2,
    color: { dark: '#10B981', light: '#FFFFFF' },
  });

  await prisma.table.update({
    where: { id: tableId },
    data: { qrCode: qrDataUrl },
  });

  return { url: menuUrl, qrCode: qrDataUrl, tableNumber: table.number };
}

export async function trackQrScan(restaurantId: string, tableId?: string, userAgent?: string, ip?: string) {
  await prisma.qrScan.create({
    data: { restaurantId, tableId, userAgent, ipAddress: ip },
  });
}

export async function getQrStats(restaurantId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, daily] = await Promise.all([
    prisma.qrScan.count({ where: { restaurantId, createdAt: { gte: since } } }),
    prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "QrScan"
      WHERE "restaurantId" = ${restaurantId} AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  return { total, daily: daily.map((d) => ({ date: d.date, count: Number(d.count) })) };
}
