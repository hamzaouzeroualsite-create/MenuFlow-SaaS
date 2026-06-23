import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    restaurantId?: string;
  };
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token d\'authentification requis', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, restaurantId: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Utilisateur non trouvé ou inactif', 401);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      restaurantId: user.restaurantId || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError('Token invalide ou expiré', 401));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Accès non autorisé', 403));
    }

    next();
  };
}

export function requireRestaurant(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user?.restaurantId && req.user?.role !== UserRole.SUPER_ADMIN) {
    return next(new AppError('Restaurant requis', 403));
  }
  next();
}
