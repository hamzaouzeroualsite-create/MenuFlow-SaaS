import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { createProductSchema, paginationSchema } from '../validators/schemas';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';

const router = Router({ mergeParams: true });

router.get('/', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query as { page: number; limit: number; search?: string };
  const where = {
    restaurantId: req.params.restaurantId,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);
  sendPaginated(res, products, total, page, limit);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    include: { category: true },
  });
  if (!product) throw new AppError('Produit non trouvé', 404);
  sendSuccess(res, product);
}));

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE));

router.post('/', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), validate(createProductSchema), asyncHandler(async (req: AuthRequest, res) => {
  const product = await prisma.product.create({
    data: { ...req.body, restaurantId: req.params.restaurantId },
    include: { category: true },
  });
  sendSuccess(res, product, 'Produit créé', 201);
}));

router.put('/:id', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await prisma.product.updateMany({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    data: req.body,
  });
  if (result.count === 0) throw new AppError('Produit non trouvé', 404);
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  sendSuccess(res, product, 'Produit mis à jour');
}));

router.patch('/:id/toggle', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE), asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
  });
  if (!product) throw new AppError('Produit non trouvé', 404);
  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { available: !product.available },
  });
  sendSuccess(res, updated);
}));

router.delete('/:id', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  await prisma.product.deleteMany({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
  });
  sendSuccess(res, null, 'Produit supprimé');
}));

export default router;
