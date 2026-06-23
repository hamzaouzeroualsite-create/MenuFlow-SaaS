import { Router } from 'express';
import { asyncHandler } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createCheckoutSession, getPlans } from '../services/subscription.service';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../utils/response';
import { UserRole, SubscriptionPlan } from '@menuflow/shared';

const router = Router();

router.get('/plans', asyncHandler(async (_req, res) => {
  sendSuccess(res, getPlans());
}));

router.use(authenticate);

router.get('/my', authorize(UserRole.OWNER), asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { restaurantId: req.user!.restaurantId! },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, subscription);
}));

router.post('/checkout', authorize(UserRole.OWNER), asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const session = await createCheckoutSession(req.user!.restaurantId!, plan as SubscriptionPlan);
  sendSuccess(res, session);
}));

export default router;
