import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { prisma } from '../lib/prisma';

export function enforceTenantAccess(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  const restaurantId = req.params.restaurantId;
  if (!restaurantId) {
    return next(new AppError('Restaurant ID requis', 400));
  }

  if (req.user?.restaurantId !== restaurantId) {
    return next(new AppError('Accès non autorisé à ce restaurant', 403));
  }

  next();
}

export async function requireActiveRestaurant(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  const restaurantId = req.params.restaurantId || req.user?.restaurantId;
  if (!restaurantId) {
    return next(new AppError('Restaurant requis', 403));
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { status: true, isActive: true },
  });

  if (!restaurant || restaurant.status === 'SUSPENDED' || !restaurant.isActive) {
    return next(new AppError('Ce restaurant est suspendu. Contactez le support MenuFlow.', 403));
  }

  next();
}

export function getScopedRestaurantId(req: AuthRequest): string {
  if (req.user?.role === UserRole.SUPER_ADMIN && req.params.restaurantId) {
    return req.params.restaurantId;
  }
  if (!req.user?.restaurantId) {
    throw new AppError('Restaurant requis', 403);
  }
  return req.user.restaurantId;
}
