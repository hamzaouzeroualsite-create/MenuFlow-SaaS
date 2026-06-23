import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { createCategorySchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { restaurantId: req.params.restaurantId, isActive: true },
    include: {
      products: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });
  sendSuccess(res, categories);
}));

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER));

router.post('/', validate(createCategorySchema), asyncHandler(async (req: AuthRequest, res) => {
  const category = await prisma.category.create({
    data: { ...req.body, restaurantId: req.params.restaurantId },
  });
  sendSuccess(res, category, 'Catégorie créée', 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const category = await prisma.category.updateMany({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    data: req.body,
  });
  if (category.count === 0) throw new AppError('Catégorie non trouvée', 404);
  const updated = await prisma.category.findUnique({ where: { id: req.params.id } });
  sendSuccess(res, updated, 'Catégorie mise à jour');
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.category.updateMany({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    data: { isActive: false },
  });
  sendSuccess(res, null, 'Catégorie supprimée');
}));

router.put('/reorder/bulk', asyncHandler(async (req, res) => {
  const { items } = req.body as { items: { id: string; sortOrder: number }[] };
  await prisma.$transaction(
    items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );
  sendSuccess(res, null, 'Ordre mis à jour');
}));

export default router;
