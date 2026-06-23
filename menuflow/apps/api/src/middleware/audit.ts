import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';

export async function auditLog(
  req: AuthRequest,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action,
        entity,
        entityId,
        details: details || undefined,
        ipAddress: req.ip,
      },
    });
  } catch {
    // Audit log failures should not break requests
  }
}

export function auditMiddleware(action: string, entity: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode < 400) {
        auditLog(req, action, entity, req.params.id, { body: req.body });
      }
      return originalJson(body);
    };
    next();
  };
}

export function getRestaurantId(req: AuthRequest): string {
  const restaurantId = req.params.restaurantId || req.user?.restaurantId;
  if (!restaurantId) throw new AppError('Restaurant ID requis', 400);
  return restaurantId;
}
