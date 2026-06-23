import { prisma } from '../lib/prisma';
import { AppError } from '../utils/response';

export async function generateMenuDescription(productName: string, ingredients: string[], language = 'fr') {
  const langMap: Record<string, string> = { fr: 'français', ar: 'arabe', en: 'anglais' };
  return {
    description: `Découvrez notre délicieux ${productName}, préparé avec ${ingredients.slice(0, 3).join(', ')}. Un plat savoureux qui ravira vos papilles.`,
    language: langMap[language] || 'français',
    generated: true,
  };
}

export async function analyzeSales(restaurantId: string) {
  const [topProducts, recentOrders, avgOrderValue] = await Promise.all([
    prisma.$queryRaw<{ name: string; quantity: number }[]>`
      SELECT p.name, SUM(oi.quantity)::int as quantity
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."restaurantId" = ${restaurantId}
      GROUP BY p.name ORDER BY quantity DESC LIMIT 5
    `,
    prisma.order.count({
      where: { restaurantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.order.aggregate({
      where: { restaurantId, status: { not: 'CANCELLED' } },
      _avg: { total: true },
    }),
  ]);

  const insights = [];
  if (topProducts.length > 0) {
    insights.push(`Votre produit le plus vendu est "${topProducts[0].name}" avec ${topProducts[0].quantity} ventes.`);
  }
  if (recentOrders < 10) {
    insights.push('Les commandes sont en baisse cette semaine. Envisagez une promotion.');
  }
  insights.push(`Valeur moyenne des commandes: ${Number(avgOrderValue._avg.total || 0).toFixed(2)} MAD`);

  return { insights, topProducts, recentOrders, avgOrderValue: Number(avgOrderValue._avg.total || 0) };
}

export async function recommendPromotions(restaurantId: string) {
  const slowProducts = await prisma.product.findMany({
    where: { restaurantId, available: true },
    include: { orderItems: { take: 1 } },
    take: 5,
  });

  const recommendations = slowProducts
    .filter((p) => p.orderItems.length === 0)
    .map((p) => ({
      productId: p.id,
      productName: p.name,
      suggestion: `Appliquez une réduction de 15% sur "${p.name}" pour stimuler les ventes`,
      suggestedDiscount: 15,
    }));

  if (recommendations.length === 0) {
    recommendations.push({
      productId: '',
      productName: 'Menu complet',
      suggestion: 'Offrez un dessert gratuit pour toute commande supérieure à 200 MAD',
      suggestedDiscount: 0,
    });
  }

  return recommendations;
}

export async function predictCustomerBehavior(restaurantId: string) {
  const customers = await prisma.customer.findMany({
    where: { restaurantId },
    orderBy: { totalSpent: 'desc' },
    take: 10,
  });

  return customers.map((c) => ({
    customerId: c.id,
    name: c.name,
    segment: c.totalOrders > 5 ? 'fidèle' : c.totalOrders > 1 ? 'régulier' : 'nouveau',
    predictedNextOrder: c.totalOrders > 3 ? '7 jours' : '14 jours',
    loyaltyScore: Math.min(100, c.loyaltyPoints),
    recommendation: c.totalOrders > 5
      ? 'Offrir un avantage VIP'
      : 'Envoyer une promotion personnalisée',
  }));
}

export async function chatbotResponse(message: string, restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, openingHours: true, phone: true },
  });

  if (!restaurant) throw new AppError('Restaurant non trouvé', 404);

  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('horaire') || lowerMsg.includes('ouvert')) {
    return { reply: `Les horaires de ${restaurant.name} sont disponibles sur notre page. Contactez-nous au ${restaurant.phone || 'N/A'}.` };
  }
  if (lowerMsg.includes('menu') || lowerMsg.includes('plat')) {
    const count = await prisma.product.count({ where: { restaurantId, available: true } });
    return { reply: `Nous avons ${count} plats disponibles. Parcourez notre menu digital pour découvrir nos spécialités !` };
  }
  if (lowerMsg.includes('réserv') || lowerMsg.includes('table')) {
    return { reply: 'Vous pouvez réserver une table directement depuis notre application. Indiquez la date, l\'heure et le nombre de convives.' };
  }

  return {
    reply: `Bienvenue chez ${restaurant.name} ! Je suis l'assistant MenuFlow. Comment puis-je vous aider ? (menu, horaires, réservation, commande)`,
  };
}
