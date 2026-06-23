import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize, requireRestaurant, AuthRequest } from '../middleware/auth';
import { getRestaurantId } from '../middleware/audit';
import { updateRestaurantSchema, paginationSchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { generateRestaurantQR } from '../services/qr.service';

const router = Router();

router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: req.params.slug, isActive: true },
    select: {
      id: true, name: true, slug: true, logo: true, coverImage: true,
      description: true, address: true, city: true, phone: true,
      openingHours: true, currency: true, language: true, settings: true,
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            where: { available: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);
  sendSuccess(res, restaurant);
}));

router.use(authenticate);

router.get('/my', requireRestaurant, asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.user!.restaurantId! },
  });
  sendSuccess(res, restaurant);
}));

router.put('/my', requireRestaurant, authorize(UserRole.OWNER, UserRole.MANAGER), validate(updateRestaurantSchema), asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await prisma.restaurant.update({
    where: { id: req.user!.restaurantId! },
    data: req.body,
  });
  sendSuccess(res, restaurant, 'Restaurant mis à jour');
}));

router.post('/my/qr', requireRestaurant, authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req: AuthRequest, res) => {
  const result = await generateRestaurantQR(req.user!.restaurantId!);
  sendSuccess(res, result);
}));

router.get('/', authorize(UserRole.SUPER_ADMIN), validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query as { page: number; limit: number; search?: string };
  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};
  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: { _count: { select: { users: true, orders: true, products: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.count({ where }),
  ]);
  sendPaginated(res, restaurants, total, page, limit);
}));

router.get('/:id', authorize(UserRole.SUPER_ADMIN), asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { users: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);
  sendSuccess(res, restaurant);
}));

export default router;
