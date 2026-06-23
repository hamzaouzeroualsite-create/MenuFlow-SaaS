import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  restaurantName: string;
  city?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Cet email est déjà utilisé', 409);

  const hashedPassword = await bcrypt.hash(data.password, 12);
  let slug = slugify(data.restaurantName);
  const slugExists = await prisma.restaurant.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.restaurantName,
        slug,
        city: data.city,
        email: data.email,
        phone: data.phone,
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

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: 'OWNER',
        restaurantId: restaurant.id,
      },
      select: { id: true, name: true, email: true, role: true, restaurantId: true },
    });

    await tx.subscription.create({
      data: {
        restaurantId: restaurant.id,
        plan: 'FREE',
        status: 'TRIAL',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, restaurant };
  });

  const tokens = await generateTokens(result.user);
  return { ...tokens, user: result.user, restaurant: result.restaurant };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { restaurant: { select: { id: true, name: true, slug: true, logo: true } } },
  });

  if (!user || !user.isActive) throw new AppError('Identifiants invalides', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Identifiants invalides', 401);

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

export { slugify };
