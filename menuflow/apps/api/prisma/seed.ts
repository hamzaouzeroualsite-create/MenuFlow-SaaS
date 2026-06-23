import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MenuFlow database...');

  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const ownerPassword = await bcrypt.hash('Owner123!', 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@menuflow.ma' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@menuflow.ma',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Demo Restaurant - Le Riad Casablanca
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'le-riad-casablanca' },
    update: {},
    create: {
      name: 'Le Riad Casablanca',
      slug: 'le-riad-casablanca',
      description: 'Restaurant marocain authentique au cœur de Casablanca. Cuisine traditionnelle revisitée avec des produits locaux de qualité.',
      address: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      phone: '+212 5 22 12 34 56',
      email: 'contact@leriad-casa.ma',
      website: 'https://leriad-casa.ma',
      currency: 'MAD',
      language: 'fr',
      subscriptionPlan: 'PREMIUM',
      openingHours: {
        monday: { open: '11:00', close: '23:00' },
        tuesday: { open: '11:00', close: '23:00' },
        wednesday: { open: '11:00', close: '23:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '00:00' },
        saturday: { open: '11:00', close: '00:00' },
        sunday: { open: '12:00', close: '22:00' },
      },
      settings: {
        theme: { primaryColor: '#10B981', secondaryColor: '#FFFFFF', accentColor: '#1F2937' },
        languages: ['fr', 'ar', 'en'],
        defaultLanguage: 'fr',
        taxes: [{ name: 'TVA', rate: 10 }],
        deliveryFee: 25,
        notifications: { email: true, sms: true, push: true, sound: true },
      },
    },
  });

  const qrUrl = await QRCode.toDataURL(`http://localhost:3000/menu/${restaurant.slug}`);
  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { qrCodeUrl: qrUrl },
  });

  // Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@leriad-casa.ma' },
    update: {},
    create: {
      name: 'Ahmed Benali',
      email: 'owner@leriad-casa.ma',
      password: ownerPassword,
      phone: '+212 6 12 34 56 78',
      role: 'RESTAURANT_OWNER',
      restaurantId: restaurant.id,
    },
  });

  // Manager
  await prisma.user.upsert({
    where: { email: 'manager@leriad-casa.ma' },
    update: {},
    create: {
      name: 'Fatima Zahra',
      email: 'manager@leriad-casa.ma',
      password: ownerPassword,
      role: 'MANAGER',
      restaurantId: restaurant.id,
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-entrees' },
      update: {},
      create: {
        id: 'cat-entrees',
        restaurantId: restaurant.id,
        name: 'Entrées',
        nameAr: 'مقبلات',
        nameEn: 'Starters',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-plats' },
      update: {},
      create: {
        id: 'cat-plats',
        restaurantId: restaurant.id,
        name: 'Plats Principaux',
        nameAr: 'أطباق رئيسية',
        nameEn: 'Main Courses',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-tajines' },
      update: {},
      create: {
        id: 'cat-tajines',
        restaurantId: restaurant.id,
        name: 'Tajines',
        nameAr: 'طاجين',
        nameEn: 'Tajines',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: {
        id: 'cat-desserts',
        restaurantId: restaurant.id,
        name: 'Desserts',
        nameAr: 'حلويات',
        nameEn: 'Desserts',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-boissons' },
      update: {},
      create: {
        id: 'cat-boissons',
        restaurantId: restaurant.id,
        name: 'Boissons',
        nameAr: 'مشروبات',
        nameEn: 'Beverages',
        sortOrder: 5,
      },
    }),
  ]);

  // Products
  const products = [
    { categoryId: 'cat-entrees', name: 'Salade Marocaine', nameAr: 'سلطة مغربية', price: 35, ingredients: ['Tomates', 'Concombres', 'Oignons', 'Persil'], featured: true },
    { categoryId: 'cat-entrees', name: 'Briouates au Fromage', nameAr: 'بريوات بالجبن', price: 45, ingredients: ['Pâte brick', 'Fromage', 'Persil'], featured: false },
    { categoryId: 'cat-entrees', name: 'Zaalouk', nameAr: 'زعلوك', price: 30, ingredients: ['Aubergines', 'Tomates', 'Ail', 'Cumin'], featured: true },
    { categoryId: 'cat-plats', name: 'Couscous Royal', nameAr: 'كسكس ملكي', price: 120, ingredients: ['Semoule', 'Légumes', 'Viande', 'Pois chiches'], featured: true, preparationTime: 30 },
    { categoryId: 'cat-plats', name: 'Pastilla au Poulet', nameAr: 'بسطيلة بالدجاج', price: 95, ingredients: ['Poulet', 'Amandes', 'Œufs', 'Pâte filo'], featured: true },
    { categoryId: 'cat-plats', name: 'Méchoui d\'Agneau', nameAr: 'مشوي ضأن', price: 150, ingredients: ['Agneau', 'Épices marocaines'], featured: false, preparationTime: 45 },
    { categoryId: 'cat-tajines', name: 'Tajine Poulet Citron', nameAr: 'طاجين دجاج بالليمون', price: 85, ingredients: ['Poulet', 'Citron confit', 'Olives'], featured: true },
    { categoryId: 'cat-tajines', name: 'Tajine Agneau Pruneaux', nameAr: 'طاجين لحم بالبرقوق', price: 110, ingredients: ['Agneau', 'Pruneaux', 'Amandes'], featured: true, promotionPrice: 95 },
    { categoryId: 'cat-tajines', name: 'Tajine Poisson', nameAr: 'طاجين سمك', price: 90, ingredients: ['Poisson', 'Tomates', 'Poivrons'], featured: false },
    { categoryId: 'cat-desserts', name: 'Chebakia', nameAr: 'شباكية', price: 25, ingredients: ['Miel', 'Sésame', 'Amandes'], featured: true },
    { categoryId: 'cat-desserts', name: 'Pastilla au Lait', nameAr: 'بسطيلة بالحليب', price: 35, ingredients: ['Lait', 'Amandes', 'Cannelle'], featured: false },
    { categoryId: 'cat-desserts', name: 'Orange Cannelle', nameAr: 'برتقال بالقرفة', price: 20, ingredients: ['Oranges', 'Cannelle', 'Fleur d\'oranger'], featured: false },
    { categoryId: 'cat-boissons', name: 'Thé à la Menthe', nameAr: 'شاي بالنعناع', price: 15, ingredients: ['Thé vert', 'Menthe', 'Sucre'], featured: true },
    { categoryId: 'cat-boissons', name: 'Jus d\'Orange Frais', nameAr: 'عصير برتقال طازج', price: 20, ingredients: ['Oranges'], featured: false },
    { categoryId: 'cat-boissons', name: 'Lben (Lait Fermenté)', nameAr: 'لبن', price: 12, ingredients: ['Lait fermenté'], featured: false },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await prisma.product.upsert({
      where: { id: `prod-${i + 1}` },
      update: {},
      create: {
        id: `prod-${i + 1}`,
        restaurantId: restaurant.id,
        categoryId: p.categoryId,
        name: p.name,
        nameAr: p.nameAr,
        description: `Délicieux ${p.name.toLowerCase()} préparé avec soin.`,
        ingredients: p.ingredients,
        allergens: [],
        price: p.price,
        promotionPrice: (p as { promotionPrice?: number }).promotionPrice || null,
        featured: p.featured,
        preparationTime: (p as { preparationTime?: number }).preparationTime || 15,
        sortOrder: i,
        available: true,
      },
    });
  }

  // Tables
  for (let i = 1; i <= 10; i++) {
    const tableQr = await QRCode.toDataURL(`http://localhost:3000/menu/${restaurant.slug}?table=${i}`);
    await prisma.table.upsert({
      where: { restaurantId_number: { restaurantId: restaurant.id, number: String(i) } },
      update: {},
      create: {
        restaurantId: restaurant.id,
        number: String(i),
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        qrCode: tableQr,
        status: i <= 3 ? 'OCCUPIED' : 'AVAILABLE',
      },
    });
  }

  // Customers
  const customers = [
    { name: 'Youssef Alami', phone: '+212 6 11 22 33 44', email: 'youssef@email.com', totalOrders: 12, totalSpent: 1450, loyaltyPoints: 145 },
    { name: 'Sara Bennani', phone: '+212 6 55 66 77 88', email: 'sara@email.com', totalOrders: 8, totalSpent: 920, loyaltyPoints: 92 },
    { name: 'Karim Idrissi', phone: '+212 6 99 88 77 66', totalOrders: 3, totalSpent: 340, loyaltyPoints: 34 },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { restaurantId_phone: { restaurantId: restaurant.id, phone: c.phone } },
      update: {},
      create: { restaurantId: restaurant.id, ...c },
    });
  }

  // Sample Orders
  const orderStatuses = ['SERVED', 'SERVED', 'PREPARING', 'PENDING', 'READY'] as const;
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        tableId: (await prisma.table.findFirst({ where: { restaurantId: restaurant.id, number: String(i + 1) } }))?.id,
        orderNumber: `MF-20250623-${String.fromCharCode(65 + i)}${i}`,
        customerName: customers[i % 3].name,
        status: orderStatuses[i],
        paymentStatus: i < 2 ? 'PAID' : 'PENDING',
        paymentMethod: 'CASH',
        subtotal: 150 + i * 30,
        tax: 15 + i * 3,
        total: 165 + i * 33,
        items: {
          create: [
            { productId: 'prod-1', quantity: 2, price: 35 },
            { productId: 'prod-7', quantity: 1, price: 85 },
          ],
        },
      },
    });
  }

  // Reservations
  await prisma.reservation.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        customerName: 'Mohammed Tazi',
        phone: '+212 6 44 55 66 77',
        guests: 4,
        reservationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      {
        restaurantId: restaurant.id,
        customerName: 'Nadia Cherkaoui',
        phone: '+212 6 33 44 55 66',
        guests: 2,
        reservationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'CONFIRMED',
      },
    ],
  });

  // Reviews
  await prisma.review.createMany({
    data: [
      { restaurantId: restaurant.id, rating: 5, comment: 'Excellent restaurant, le couscous est incroyable !' },
      { restaurantId: restaurant.id, rating: 4, comment: 'Très bon service, ambiance chaleureuse.' },
      { restaurantId: restaurant.id, rating: 5, comment: 'Le meilleur tajine de Casablanca !' },
    ],
  });

  // Subscription
  await prisma.subscription.create({
    data: {
      restaurantId: restaurant.id,
      plan: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // Coupon
  await prisma.coupon.create({
    data: {
      restaurantId: restaurant.id,
      code: 'BIENVENUE10',
      discount: 10,
      discountType: 'percentage',
      minOrder: 100,
      maxUses: 100,
    },
  });

  // QR Scans
  for (let i = 0; i < 50; i++) {
    await prisma.qrScan.create({
      data: {
        restaurantId: restaurant.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Platform settings
  await prisma.platformSettings.upsert({
    where: { id: 'platform' },
    update: {},
    create: {
      id: 'platform',
      settings: {
        platformName: 'MenuFlow',
        supportEmail: 'support@menuflow.ma',
        defaultCurrency: 'MAD',
        autoBackupEnabled: true,
        autoBackupHour: 2,
        maintenanceMode: false,
      },
      updatedBy: superAdmin.id,
    },
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Comptes de test:');
  console.log('  Super Admin: admin@menuflow.ma / Admin123!  → /admin');
  console.log('  Owner:       owner@leriad-casa.ma / Owner123! → /dashboard');
  console.log('  Manager:     manager@leriad-casa.ma / Owner123!');
  console.log('');
  console.log('🏪 Restaurant: Le Riad Casablanca');
  console.log('  Menu: http://localhost:3000/menu/le-riad-casablanca');
  console.log('  Dashboard: http://localhost:3000/dashboard');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
