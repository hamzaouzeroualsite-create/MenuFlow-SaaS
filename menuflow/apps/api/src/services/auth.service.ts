import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';

export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true, logo: true, subscriptionPlan: true, status: true },
      },
    },
  });

  const logLogin = async (userId: string, success: boolean) => {
    try {
      await prisma.loginHistory.create({
        data: { userId, ipAddress, userAgent, success },
      });
      if (success) {
        await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
      }
    } catch { /* non-blocking */ }
  };

  if (!user || !user.isActive) {
    if (user) await logLogin(user.id, false);
    throw new AppError('Identifiants invalides', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await logLogin(user.id, false);
    throw new AppError('Identifiants invalides', 401);
  }

  if (
    user.role !== UserRole.SUPER_ADMIN &&
    user.restaurant &&
    (user.restaurant.status === 'SUSPENDED')
  ) {
    throw new AppError('Ce restaurant est suspendu. Contactez MenuFlow.', 403);
  }

  await logLogin(user.id, true);

  const tokens = await generateTokens(user);
  const { password: _, ...safeUser } = user;
  return { ...tokens, user: safeUser };
}

async function generateTokens(user: { id: string; email: string; role: string; restaurantId: string | null }) {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    restaurantId: user.restaurantId || undefined,
  });

  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token invalide ou expiré', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) throw new AppError('Utilisateur non trouvé', 401);

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    restaurantId: user.restaurantId || undefined,
  });

  return { accessToken };
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MF-${prefix}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
