import { Router } from 'express';
import { asyncHandler } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import {
  getDashboardStats,
  getRevenueChart,
  getPopularProducts,
  getPeakHours,
  getCustomerRetention,
} from '../services/analytics.service';
import { getQrStats } from '../services/qr.service';
import { sendSuccess } from '../utils/response';
import { UserRole } from '@menuflow/shared';

const router = Router({ mergeParams: true });

router.use(authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.params.restaurantId);
  sendSuccess(res, stats);
}));

router.get('/revenue', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const data = await getRevenueChart(req.params.restaurantId, days);
  sendSuccess(res, data);
}));

router.get('/products', asyncHandler(async (req, res) => {
  const data = await getPopularProducts(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/peak-hours', asyncHandler(async (req, res) => {
  const data = await getPeakHours(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/retention', asyncHandler(async (req, res) => {
  const data = await getCustomerRetention(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/qr-scans', asyncHandler(async (req, res) => {
  const data = await getQrStats(req.params.restaurantId);
  sendSuccess(res, data);
}));

export default router;
