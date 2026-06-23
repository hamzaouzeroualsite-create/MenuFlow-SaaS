import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';
import { generateOrderNumber } from './auth.service';
import { Decimal } from '@prisma/client/runtime/library';

export async function createOrder(
  restaurantId: string,
  data: {
    tableId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    notes?: string;
    couponCode?: string;
    items: { productId: string; quantity: number; notes?: string }[];
  }
) {
  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map((i) => i.productId) },
      restaurantId,
      available: true,
    },
  });

  if (products.length !== data.items.length) {
    throw new AppError('Un ou plusieurs produits ne sont pas disponibles', 400);
  }

  let subtotal = new Decimal(0);
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const price = product.promotionPrice || product.price;
    subtotal = subtotal.add(price.mul(item.quantity));
    return {
      productId: item.productId,
      quantity: item.quantity,
      price,
      notes: item.notes,
    };
  });

  let discount = new Decimal(0);
  if (data.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { restaurantId, code: data.couponCode, isActive: true },
    });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      if (coupon.discountType === 'percentage') {
        discount = subtotal.mul(coupon.discount).div(100);
      } else {
        discount = coupon.discount;
      }
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  const settings = restaurant?.settings as { taxes?: { rate: number }[] } | null;
  const taxRate = settings?.taxes?.[0]?.rate || 10;
  const taxableAmount = subtotal.sub(discount);
  const tax = taxableAmount.mul(taxRate).div(100);
  const total = taxableAmount.add(tax);

  let customerId: string | undefined;
  if (data.customerPhone) {
    const customer = await prisma.customer.upsert({
      where: { restaurantId_phone: { restaurantId, phone: data.customerPhone } },
      create: {
        restaurantId,
        name: data.customerName || 'Client',
        phone: data.customerPhone,
      },
      update: { name: data.customerName || undefined },
    });
    customerId = customer.id;
  }

  const order = await prisma.order.create({
    data: {
      restaurantId,
      tableId: data.tableId,
      customerId,
      orderNumber: generateOrderNumber(),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paymentMethod: (data.paymentMethod as 'CASH') || 'CASH',
      subtotal,
      tax,
      discount,
      total,
      notes: data.notes,
      couponCode: data.couponCode,
      items: { create: orderItems },
    },
    include: {
      items: { include: { product: { select: { id: true, name: true, image: true } } } },
      table: { select: { number: true } },
    },
  });

  if (customerId) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: total },
        loyaltyPoints: { increment: Math.floor(Number(total) / 10) },
      },
    });
  }

  return order;
}

export async function updateOrderStatus(orderId: string, restaurantId: string, status: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } });
  if (!order) throw new AppError('Commande non trouvée', 404);

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as 'PENDING' },
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
      table: { select: { number: true } },
    },
  });
}

export async function getOrders(restaurantId: string, filters: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where = {
    restaurantId,
    ...(filters.status && { status: filters.status as 'PENDING' }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { id: true, name: true, image: true } } } },
        table: { select: { number: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, limit };
}
