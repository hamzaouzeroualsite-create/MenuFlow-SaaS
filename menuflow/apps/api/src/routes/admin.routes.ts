import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, requireSuperAdmin, AuthRequest } from '../middleware/auth';
import {
  paginationSchema,
  adminCreateRestaurantSchema,
  adminUpdateRestaurantSchema,
  suspendRestaurantSchema,
  adminCreateOwnerSchema,
  resetPasswordSchema,
  updateSubscriptionAdminSchema,
  platformSettingsSchema,
} from '../validators/schemas';
import {
  getPlatformDashboard,
  listRestaurants,
  createRestaurant,
  updateRestaurantAdmin,
  suspendRestaurant,
  activateRestaurant,
  deleteRestaurant,
  getRestaurantAnalytics,
  listUsers,
  createRestaurantOwner,
  resetUserPassword,
  toggleUserActive,
  impersonateUser,
  listSubscriptions,
  updateSubscription,
  expireSubscriptions,
  getMonitoringOrders,
  getMonitoringReservations,
  getAuditLogs,
  getLoginHistory,
  createBackup,
  listBackups,
  getPlatformSettings,
  updatePlatformSettings,
  getAdminNotifications,
  markNotificationRead,
} from '../services/admin.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate, requireSuperAdmin);

// Dashboard
router.get('/dashboard', asyncHandler(async (_req, res) => {
  const stats = await getPlatformDashboard();
  sendSuccess(res, stats);
}));

// Restaurants
router.get('/restaurants', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, search, city, plan, status } = req.query as Record<string, string | number>;
  const result = await listRestaurants({ page: Number(page), limit: Number(limit), search, city, plan, status });
  sendPaginated(res, result.restaurants, result.total, result.page, result.limit);
}));

router.post('/restaurants', validate(adminCreateRestaurantSchema), asyncHandler(async (req: AuthRequest, res) => {
  const result = await createRestaurant({ ...req.body, onboardedBy: req.user!.userId });
  await auditLog(req, 'CREATE', 'Restaurant', result.restaurant.id, { name: result.restaurant.name });
  sendSuccess(res, result, 'Restaurant créé avec succès', 201);
}));

router.get('/restaurants/:id', asyncHandler(async (req, res) => {
  const analytics = await getRestaurantAnalytics(req.params.id);
  sendSuccess(res, analytics);
}));

router.put('/restaurants/:id', validate(adminUpdateRestaurantSchema), asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await updateRestaurantAdmin(req.params.id, req.body);
  await auditLog(req, 'UPDATE', 'Restaurant', req.params.id, req.body);
  sendSuccess(res, restaurant, 'Restaurant mis à jour');
}));

router.post('/restaurants/:id/suspend', validate(suspendRestaurantSchema), asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await suspendRestaurant(req.params.id, req.body.reason, req.user!.userId);
  await auditLog(req, 'SUSPEND', 'Restaurant', req.params.id, { reason: req.body.reason });
  sendSuccess(res, restaurant, 'Restaurant suspendu');
}));

router.post('/restaurants/:id/activate', asyncHandler(async (req: AuthRequest, res) => {
  const restaurant = await activateRestaurant(req.params.id, req.user!.userId);
  await auditLog(req, 'ACTIVATE', 'Restaurant', req.params.id);
  sendSuccess(res, restaurant, 'Restaurant activé');
}));

router.delete('/restaurants/:id', asyncHandler(async (req: AuthRequest, res) => {
  const result = await deleteRestaurant(req.params.id);
  await auditLog(req, 'DELETE', 'Restaurant', req.params.id);
  sendSuccess(res, result, 'Restaurant supprimé');
}));

router.post('/restaurants/:id/impersonate', asyncHandler(async (req: AuthRequest, res) => {
  const restaurantUsers = await listUsers({ limit: 100 });
  const target = restaurantUsers.users.find(
    (u) => u.restaurantId === req.params.id && u.role === 'RESTAURANT_OWNER'
  );
  if (!target) {
    res.status(404).json({ success: false, error: 'Propriétaire non trouvé' });
    return;
  }
  const result = await impersonateUser(target.id, req.user!.userId);
  await auditLog(req, 'IMPERSONATE', 'User', target.id, { restaurantId: req.params.id });
  sendSuccess(res, result, 'Session propriétaire générée');
}));

// Users
router.get('/users', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query as Record<string, string | number>;
  const result = await listUsers({ page: Number(page), limit: Number(limit), search, role });
  sendPaginated(res, result.users, result.total, result.page, result.limit);
}));

router.post('/users/owner', validate(adminCreateOwnerSchema), asyncHandler(async (req: AuthRequest, res) => {
  const user = await createRestaurantOwner(req.body);
  await auditLog(req, 'CREATE', 'User', user.id, { role: 'RESTAURANT_OWNER' });
  sendSuccess(res, user, 'Propriétaire créé', 201);
}));

router.post('/users/:id/reset-password', validate(resetPasswordSchema), asyncHandler(async (req: AuthRequest, res) => {
  await resetUserPassword(req.params.id, req.body.newPassword);
  await auditLog(req, 'RESET_PASSWORD', 'User', req.params.id);
  sendSuccess(res, null, 'Mot de passe réinitialisé');
}));

router.patch('/users/:id/toggle-active', asyncHandler(async (req: AuthRequest, res) => {
  const user = await toggleUserActive(req.params.id, req.body.isActive ?? false);
  await auditLog(req, 'TOGGLE_ACTIVE', 'User', req.params.id, { isActive: req.body.isActive });
  sendSuccess(res, user);
}));

router.post('/users/:id/impersonate', asyncHandler(async (req: AuthRequest, res) => {
  const result = await impersonateUser(req.params.id, req.user!.userId);
  await auditLog(req, 'IMPERSONATE', 'User', req.params.id);
  sendSuccess(res, result, 'Session générée');
}));

// Subscriptions
router.get('/subscriptions', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query as Record<string, string | number>;
  const result = await listSubscriptions({ page: Number(page), limit: Number(limit), status: status as string });
  sendPaginated(res, result.subscriptions, result.total, result.page, result.limit);
}));

router.put('/subscriptions/:id', validate(updateSubscriptionAdminSchema), asyncHandler(async (req: AuthRequest, res) => {
  const sub = await updateSubscription(req.params.id, req.body);
  await auditLog(req, 'UPDATE', 'Subscription', req.params.id, req.body);
  sendSuccess(res, sub, 'Abonnement mis à jour');
}));

router.post('/subscriptions/expire-check', asyncHandler(async (_req, res) => {
  const result = await expireSubscriptions();
  sendSuccess(res, result);
}));

// Monitoring
router.get('/monitoring/orders', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const result = await getMonitoringOrders(page, limit);
  sendPaginated(res, result.orders, result.total, page, limit);
}));

router.get('/monitoring/reservations', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const result = await getMonitoringReservations(page, limit);
  sendPaginated(res, result.reservations, result.total, page, limit);
}));

// Audit & Login History
router.get('/audit-logs', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const action = req.query.action as string | undefined;
  const entity = req.query.entity as string | undefined;
  const result = await getAuditLogs({ page, limit, action, entity });
  sendPaginated(res, result.logs, result.total, page, limit);
}));

router.get('/login-history', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const result = await getLoginHistory(page, limit);
  sendPaginated(res, result.history, result.total, page, limit);
}));

// Backups
router.get('/backups', validate(paginationSchema), asyncHandler(async (req, res) => {
  const { page, limit } = req.query as { page: number; limit: number };
  const result = await listBackups(page, limit);
  sendPaginated(res, result.backups, result.total, page, limit);
}));

router.post('/backups', asyncHandler(async (req: AuthRequest, res) => {
  const backup = await createBackup('MANUAL', req.user!.userId);
  await auditLog(req, 'CREATE', 'Backup', backup.id);
  sendSuccess(res, backup, 'Backup créé', 201);
}));

// Settings & Notifications
router.get('/settings', asyncHandler(async (_req, res) => {
  const settings = await getPlatformSettings();
  sendSuccess(res, settings);
}));

router.put('/settings', validate(platformSettingsSchema), asyncHandler(async (req: AuthRequest, res) => {
  const settings = await updatePlatformSettings(req.body, req.user!.userId);
  await auditLog(req, 'UPDATE', 'PlatformSettings', 'platform');
  sendSuccess(res, settings, 'Paramètres mis à jour');
}));

router.get('/notifications', asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const notifications = await getAdminNotifications(unreadOnly);
  sendSuccess(res, notifications);
}));

router.patch('/notifications/:id/read', asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.params.id);
  sendSuccess(res, notification);
}));

export default router;
