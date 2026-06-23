import { Router } from 'express';
import { asyncHandler } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getRevenueChart,
  getPopularProducts,
  getPeakHours,
  getCustomerRetention,
  getSuperAdminStats,
} from '../services/analytics.service';
import { getQrStats } from '../services/qr.service';
import { sendSuccess } from '../utils/response';
import { UserRole } from '@menuflow/shared';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/dashboard', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.params.restaurantId);
  sendSuccess(res, stats);
}));

router.get('/revenue', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const data = await getRevenueChart(req.params.restaurantId, days);
  sendSuccess(res, data);
}));

router.get('/products', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await getPopularProducts(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/peak-hours', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await getPeakHours(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/retention', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await getCustomerRetention(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/qr-scans', authorize(UserRole.OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const data = await getQrStats(req.params.restaurantId);
  sendSuccess(res, data);
}));

router.get('/super-admin', authorize(UserRole.SUPER_ADMIN), asyncHandler(async (_req, res) => {
  const stats = await getSuperAdminStats();
  sendSuccess(res, stats);
}));

export default router;
