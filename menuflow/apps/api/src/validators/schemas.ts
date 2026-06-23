import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    city: z.string().optional(),
    plan: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
  }),
});

export const adminCreateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    description: z.string().optional(),
    subscriptionPlan: z.enum(['FREE', 'STARTER', 'PREMIUM', 'ENTERPRISE']).optional(),
    ownerName: z.string().min(2),
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(8),
    ownerPhone: z.string().optional(),
  }),
});

export const adminUpdateRestaurantSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    description: z.string().optional(),
    subscriptionPlan: z.enum(['FREE', 'STARTER', 'PREMIUM', 'ENTERPRISE']).optional(),
    website: z.string().url().optional(),
  }),
});

export const suspendRestaurantSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ reason: z.string().optional() }),
});

export const adminCreateOwnerSchema = z.object({
  body: z.object({
    restaurantId: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ newPassword: z.string().min(8) }),
});

export const updateSubscriptionAdminSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    plan: z.enum(['FREE', 'STARTER', 'PREMIUM', 'ENTERPRISE']).optional(),
    status: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL']).optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    nameAr: z.string().optional(),
    nameEn: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    name: z.string().min(1),
    nameAr: z.string().optional(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    descriptionEn: z.string().optional(),
    image: z.string().optional(),
    price: z.number().positive(),
    promotionPrice: z.number().positive().optional(),
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    calories: z.number().int().optional(),
    preparationTime: z.number().int().optional(),
    featured: z.boolean().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    tableId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'STRIPE', 'PAYPAL', 'CMI', 'PAYZONE']).optional(),
    notes: z.string().optional(),
    couponCode: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
      })
    ).min(1),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
  }),
});

export const createReservationSchema = z.object({
  body: z.object({
    customerName: z.string().min(1),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    guests: z.number().int().positive(),
    reservationDate: z.string().datetime(),
    notes: z.string().optional(),
    tableId: z.string().optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    customerId: z.string().optional(),
  }),
});

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role: z.enum(['MANAGER', 'EMPLOYEE']),
  }),
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    openingHours: z.record(z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean().optional(),
    })).optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    settings: z.record(z.unknown()).optional(),
  }),
});

export const createTableSchema = z.object({
  body: z.object({
    number: z.string().min(1),
    capacity: z.number().int().positive().optional(),
  }),
});

export const platformSettingsSchema = z.object({
  body: z.record(z.unknown()),
});
