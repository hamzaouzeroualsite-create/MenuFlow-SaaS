import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize, requireRestaurant, AuthRequest } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { updateRestaurantSchema, paginationSchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { generateRestaurantQR } from '../services/qr.service';

const router = Router();

router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: req.params.slug, status: 'ACTIVE', isActive: true },
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

router.put('/my', requireRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), validate(updateRestaurantSchema), asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await prisma.restaurant.update({
    where: { id: req.user!.restaurantId! },
    data: req.body,
  });
  sendSuccess(res, restaurant, 'Restaurant mis à jour');
}));

router.post('/my/qr', requireRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req: AuthRequest, res) => {
  const result = await generateRestaurantQR(req.user!.restaurantId!);
  sendSuccess(res, result);
}));

export default router;
