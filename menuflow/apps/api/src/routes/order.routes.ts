import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import { createOrderSchema, updateOrderStatusSchema, paginationSchema } from '../validators/schemas';
import { createOrder, updateOrderStatus, getOrders } from '../services/order.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { getIO } from '../socket';

const router = Router({ mergeParams: true });

router.post('/', validate(createOrderSchema), asyncHandler(async (req, res) => {
  const order = await createOrder(req.params.restaurantId, req.body);
  try {
    getIO().to(`restaurant:${req.params.restaurantId}`).emit('order:new', {
      orderId: order.id,
      restaurantId: req.params.restaurantId,
      order,
    });
  } catch { /* socket not ready */ }
  sendSuccess(res, order, 'Commande créée', 201);
}));

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant);

router.get('/', validate(paginationSchema), authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const status = req.query.status as string | undefined;
  const result = await getOrders(req.params.restaurantId, { status, page, limit });
  sendPaginated(res, result.orders, result.total, page, limit);
}));

router.get('/kitchen', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE), asyncHandler(async (req, res) => {
  const result = await getOrders(req.params.restaurantId, {
    status: undefined,
    page: 1,
    limit: 50,
  });
  const active = result.orders.filter((o) => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  sendSuccess(res, active);
}));

router.patch('/:id/status', authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER, UserRole.EMPLOYEE), validate(updateOrderStatusSchema), asyncHandler(async (req, res) => {
  const order = await updateOrderStatus(req.params.id, req.params.restaurantId, req.body.status);
  try {
    getIO().to(`restaurant:${req.params.restaurantId}`).emit('order:updated', {
      orderId: order.id,
      status: order.status,
      restaurantId: req.params.restaurantId,
      order,
    });
    if (order.customerId) {
      getIO().to(`customer:${order.customerId}`).emit('order:updated', {
        orderId: order.id,
        status: order.status,
      });
    }
  } catch { /* socket not ready */ }
  sendSuccess(res, order, 'Statut mis à jour');
}));

export default router;
