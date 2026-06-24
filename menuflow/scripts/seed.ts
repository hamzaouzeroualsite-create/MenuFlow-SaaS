/**
 * Firebase seed script — run after configuring Firebase Admin credentials.
 * Usage: npx ts-node scripts/seed.ts
 */
import * as admin from 'firebase-admin';

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  console.error('Set FIREBASE_ADMIN_* env vars. See .env.example');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();
const restaurantId = 'le-gourmet-1';

async function seed() {
  console.log('Seeding MenuFlow data...');

  await db.collection('restaurants').doc(restaurantId).set({
    restaurantId,
    name: 'Le Gourmet',
    slug: 'le-gourmet',
    description: 'Restaurant gastronomique au cœur de Casablanca',
    address: '123 Boulevard Mohammed V',
    city: 'Casablanca',
    phone: '+212 522 123 456',
    email: 'contact@legourmet.ma',
    status: 'ACTIVE',
    subscriptionPlan: 'PREMIUM',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z',
    settings: {
      theme: { primaryColor: '#10B981', secondaryColor: '#F9FAFB', accentColor: '#059669' },
      languages: ['fr', 'en', 'ar'],
      defaultLanguage: 'fr',
      taxes: [{ name: 'TVA', rate: 10 }],
      deliveryFee: 15,
      tableCount: 20,
      currency: 'MAD',
      notifications: { email: true, sms: true, push: true, sound: true },
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const categories = [
    { id: 'cat-pizza', name: 'Pizzas', nameEn: 'Pizzas', nameAr: 'بيتزا', sortOrder: 0 },
    { id: 'cat-burgers', name: 'Burgers', nameEn: 'Burgers', nameAr: 'برغر', sortOrder: 1 },
    { id: 'cat-tacos', name: 'Tacos', nameEn: 'Tacos', nameAr: 'تاكوس', sortOrder: 2 },
    { id: 'cat-drinks', name: 'Boissons', nameEn: 'Drinks', nameAr: 'مشروبات', sortOrder: 3 },
    { id: 'cat-desserts', name: 'Desserts', nameEn: 'Desserts', nameAr: 'حلويات', sortOrder: 4 },
  ];

  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set({
      ...cat, restaurantId, isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const products = [
    { id: 'prod-1', categoryId: 'cat-pizza', name: 'Pizza Margherita', price: 65, ingredients: ['Tomate', 'Mozzarella', 'Basilic'], allergens: ['Gluten', 'Lactose'], isFeatured: true },
    { id: 'prod-2', categoryId: 'cat-pizza', name: 'Pizza 4 Fromages', price: 75, ingredients: ['Mozzarella', 'Gorgonzola'], allergens: ['Gluten', 'Lactose'], isFeatured: true },
    { id: 'prod-3', categoryId: 'cat-burgers', name: 'Burger Classic', price: 55, ingredients: ['Bœuf', 'Cheddar'], allergens: ['Gluten'], isFeatured: false },
    { id: 'prod-4', categoryId: 'cat-tacos', name: 'Tacos Poulet', price: 45, ingredients: ['Poulet'], allergens: ['Gluten'], isFeatured: false },
    { id: 'prod-5', categoryId: 'cat-drinks', name: 'Jus d\'Orange', price: 25, ingredients: ['Orange'], allergens: [], isFeatured: false },
    { id: 'prod-6', categoryId: 'cat-desserts', name: 'Tiramisu', price: 35, ingredients: ['Mascarpone'], allergens: ['Lactose'], isFeatured: true },
  ];

  for (const prod of products) {
    await db.collection('products').doc(prod.id).set({
      ...prod, restaurantId, description: prod.name, isAvailable: true, sortOrder: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(console.error);
