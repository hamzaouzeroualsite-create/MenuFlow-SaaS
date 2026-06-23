import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { createReservationSchema, paginationSchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendPaginated, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { getIO } from '../socket';

const router = Router({ mergeParams: true });

router.post('/', validate(createReservationSchema), asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.create({
    data: {
      ...req.body,
      restaurantId: req.params.restaurantId,
      reservationDate: new Date(req.body.reservationDate),
    },
  });
  try {
    getIO().to(`restaurant:${req.params.restaurantId}`).emit('reservation:new', {
      reservationId: reservation.id,
      restaurantId: req.params.restaurantId,
    });
  } catch { /* socket not ready */ }
  sendSuccess(res, reservation, 'Réservation créée', 201);
}));

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE));

router.get('/', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const status = req.query.status as string | undefined;
  const where = {
    restaurantId: req.params.restaurantId,
    ...(status && { status: status as 'PENDING' }),
  };
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: { table: { select: { number: true } } },
      orderBy: { reservationDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reservation.count({ where }),
  });
  sendPaginated(res, reservations, total, page, limit);
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, tableId } = req.body;
  const result = await prisma.reservation.updateMany({
    where: { id: req.params.id, restaurantId: req.params.restaurantId },
    data: { status, tableId },
  });
  if (result.count === 0) throw new AppError('Réservation non trouvée', 404);
  const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });
  sendSuccess(res, reservation, 'Réservation mise à jour');
}));

export default router;
