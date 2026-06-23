import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { createReviewSchema, paginationSchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendPaginated } from '../utils/response';
import { UserRole } from '@menuflow/shared';

const router = Router({ mergeParams: true });

router.post('/reviews', validate(createReviewSchema), asyncHandler(async (req, res) => {
  const review = await prisma.review.create({
    data: { ...req.body, restaurantId: req.params.restaurantId },
  });
  sendSuccess(res, review, 'Avis publié', 201);
}));

router.get('/reviews', asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { restaurantId: req.params.restaurantId },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  sendSuccess(res, reviews);
}));

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER));

router.get('/', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query as { page: number; limit: number; search?: string };
  const where = {
    restaurantId: req.params.restaurantId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { totalSpent: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);
  sendPaginated(res, customers, total, page, limit);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    include: {
      orders: { orderBy: { createdAt: 'desc' }, take: 10 },
      reviews: true,
    },
  });
  sendSuccess(res, customer);
}));

export default router;
