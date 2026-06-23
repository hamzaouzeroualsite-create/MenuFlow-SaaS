import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { loginSchema, refreshTokenSchema } from '../validators/schemas';
import { loginUser, refreshAccessToken, logoutUser } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const result = await loginUser(
    req.body.email,
    req.body.password,
    req.ip,
    req.headers['user-agent']
  );
  sendSuccess(res, result, 'Connexion réussie');
}));

router.post('/refresh', validate(refreshTokenSchema), asyncHandler(async (req, res) => {
  const result = await refreshAccessToken(req.body.refreshToken);
  sendSuccess(res, result);
}));

router.post('/logout', validate(refreshTokenSchema), asyncHandler(async (req, res) => {
  await logoutUser(req.body.refreshToken);
  sendSuccess(res, null, 'Déconnexion réussie');
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      restaurantId: true,
      restaurant: {
        select: {
          id: true, name: true, slug: true, logo: true,
          subscriptionPlan: true, status: true,
        },
      },
    },
  });
  sendSuccess(res, { ...user, impersonatedBy: req.user?.impersonatedBy });
}));

export default router;
