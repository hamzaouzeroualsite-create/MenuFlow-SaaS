import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/schemas';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription restaurant + propriétaire
 */
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  sendSuccess(res, result, 'Inscription réussie', 201);
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion
 */
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const result = await loginUser(req.body.email, req.body.password);
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
      restaurant: { select: { id: true, name: true, slug: true, logo: true, subscriptionPlan: true } },
    },
  });
  sendSuccess(res, user);
}));

export default router;
