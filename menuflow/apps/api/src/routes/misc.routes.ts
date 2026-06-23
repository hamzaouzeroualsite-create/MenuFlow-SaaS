import { Router } from 'express';
import { asyncHandler, validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createTableSchema, createEmployeeSchema } from '../validators/schemas';
import { prisma } from '../lib/prisma';
import { sendSuccess, AppError } from '../utils/response';
import { UserRole } from '@menuflow/shared';
import { generateTableQR, trackQrScan } from '../services/qr.service';
import {
  generateMenuDescription,
  analyzeSales,
  recommendPromotions,
  predictCustomerBehavior,
  chatbotResponse,
} from '../services/ai.service';
import { enforceTenantAccess, requireActiveRestaurant } from '../middleware/tenant';
import bcrypt from 'bcryptjs';

const router = Router({ mergeParams: true });

// Tables
router.get('/tables', asyncHandler(async (req, res) => {
  const tables = await prisma.table.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { number: 'asc' },
  });
  sendSuccess(res, tables);
}));

router.post('/tables', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), validate(createTableSchema), asyncHandler(async (req, res) => {
  const table = await prisma.table.create({
    data: { ...req.body, restaurantId: req.params.restaurantId },
  });
  sendSuccess(res, table, 'Table créée', 201);
}));

router.post('/tables/:tableId/qr', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await generateTableQR(req.params.restaurantId, req.params.tableId);
  sendSuccess(res, result);
}));

// QR Scan tracking
router.post('/scan', asyncHandler(async (req, res) => {
  await trackQrScan(req.params.restaurantId, req.body.tableId, req.headers['user-agent'], req.ip);
  sendSuccess(res, null, 'Scan enregistré');
}));

// Employees
router.get('/employees', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const employees = await prisma.user.findMany({
    where: { restaurantId: req.params.restaurantId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  sendSuccess(res, employees);
}));

router.post('/employees', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER), validate(createEmployeeSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) throw new AppError('Email déjà utilisé', 409);

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const employee = await prisma.user.create({
    data: {
      ...req.body,
      password: hashedPassword,
      restaurantId: req.params.restaurantId,
    },
    select: { id: true, name: true, email: true, role: true },
  });
  sendSuccess(res, employee, 'Employé ajouté', 201);
}));

// AI Features
router.post('/ai/description', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await generateMenuDescription(req.body.productName, req.body.ingredients || [], req.body.language);
  sendSuccess(res, result);
}));

router.get('/ai/sales-analysis', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await analyzeSales(req.params.restaurantId);
  sendSuccess(res, result);
}));

router.get('/ai/promotions', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await recommendPromotions(req.params.restaurantId);
  sendSuccess(res, result);
}));

router.get('/ai/customer-prediction', authenticate, enforceTenantAccess, requireActiveRestaurant, authorize(UserRole.RESTAURANT_OWNER, UserRole.MANAGER), asyncHandler(async (req, res) => {
  const result = await predictCustomerBehavior(req.params.restaurantId);
  sendSuccess(res, result);
}));

router.post('/ai/chatbot', asyncHandler(async (req, res) => {
  const result = await chatbotResponse(req.body.message, req.params.restaurantId);
  sendSuccess(res, result);
}));

export default router;
