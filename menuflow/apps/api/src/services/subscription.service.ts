import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';
import { SubscriptionPlan } from '@menuflow/shared';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PLAN_PRICES: Record<string, { monthly: number; name: string }> = {
  STARTER: { monthly: 299, name: 'Starter' },
  PREMIUM: { monthly: 599, name: 'Premium' },
  ENTERPRISE: { monthly: 1299, name: 'Enterprise' },
};

export async function createCheckoutSession(restaurantId: string, plan: SubscriptionPlan) {
  if (!stripe) throw new AppError('Stripe non configuré', 503);

  const planConfig = PLAN_PRICES[plan];
  if (!planConfig) throw new AppError('Plan invalide', 400);

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'mad',
        product_data: { name: `MenuFlow ${planConfig.name}` },
        unit_amount: planConfig.monthly * 100,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    metadata: { restaurantId, plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?cancelled=true`,
  });

  return { sessionId: session.id, url: session.url };
}

export async function handleStripeWebhook(event: Stripe.Event) {
  if (!stripe) return;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { restaurantId, plan } = session.metadata || {};
      if (restaurantId && plan) {
        await prisma.$transaction([
          prisma.subscription.create({
            data: {
              restaurantId,
              plan: plan as SubscriptionPlan,
              status: 'ACTIVE',
              startDate: new Date(),
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
          }),
          prisma.restaurant.update({
            where: { id: restaurantId },
            data: { subscriptionPlan: plan as SubscriptionPlan },
          }),
        ]);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (dbSub) {
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: dbSub.id },
            data: { status: 'CANCELLED', endDate: new Date() },
          }),
          prisma.restaurant.update({
            where: { id: dbSub.restaurantId },
            data: { subscriptionPlan: 'FREE' },
          }),
        ]);
      }
      break;
    }
  }
}

export function getPlans() {
  return [
    {
      id: 'FREE',
      name: 'Gratuit',
      price: 0,
      features: ['20 produits', '5 catégories', '5 tables', '2 employés', 'Menu QR'],
    },
    {
      id: 'STARTER',
      name: 'Starter',
      price: 299,
      features: ['100 produits', '20 catégories', '20 tables', '5 employés', 'Analytics', 'Réservations'],
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 599,
      features: ['500 produits', '50 catégories', '50 tables', '15 employés', 'IA', 'CRM', 'Multi-langue'],
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 1299,
      features: ['Illimité', 'Multi-restaurants', 'API dédiée', 'Support prioritaire', 'White label'],
    },
  ];
}
