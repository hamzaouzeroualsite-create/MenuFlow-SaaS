import type {
  Restaurant,
  User,
  Category,
  Product,
  Order,
  Reservation,
  Customer,
  Subscription,
  AnalyticsEvent,
  AuditLog,
  DashboardStats,
  PlatformStats,
  QRCode,
} from '@/types';

const now = new Date().toISOString();
const restaurantId = 'demo-restaurant-1';

export const DEMO_RESTAURANT: Restaurant = {
  id: restaurantId,
  restaurantId,
  name: 'Le Gourmet',
  slug: 'le-gourmet',
  description: 'Restaurant gastronomique au cœur de Casablanca',
  address: '123 Boulevard Mohammed V',
  city: 'Casablanca',
  phone: '+212 522 123 456',
  email: 'contact@legourmet.ma',
  logo: '/demo/restaurant-logo.jpg',
  coverImage: '/demo/restaurant-cover.jpg',
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
  createdAt: now,
  updatedAt: now,
};

export const DEMO_USERS: User[] = [
  {
    id: 'demo-super-admin',
    email: 'admin@menuflow.ma',
    name: 'Hamza Ouzeroual',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-owner',
    restaurantId,
    email: 'owner@legourmet.ma',
    name: 'Ahmed Benali',
    role: 'RESTAURANT_OWNER',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-pizza', restaurantId, name: 'Pizzas', nameEn: 'Pizzas', nameAr: 'بيتزا', sortOrder: 0, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-burgers', restaurantId, name: 'Burgers', nameEn: 'Burgers', nameAr: 'برغر', sortOrder: 1, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-tacos', restaurantId, name: 'Tacos', nameEn: 'Tacos', nameAr: 'تاكوس', sortOrder: 2, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-drinks', restaurantId, name: 'Boissons', nameEn: 'Drinks', nameAr: 'مشروبات', sortOrder: 3, isActive: true, createdAt: now, updatedAt: now },
  { id: 'cat-desserts', restaurantId, name: 'Desserts', nameEn: 'Desserts', nameAr: 'حلويات', sortOrder: 4, isActive: true, createdAt: now, updatedAt: now },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1', restaurantId, categoryId: 'cat-pizza', name: 'Pizza Margherita', nameEn: 'Margherita Pizza', nameAr: 'بيتزا مارغريتا',
    description: 'Sauce tomate, mozzarella fraîche, basilic', price: 65, ingredients: ['Tomate', 'Mozzarella', 'Basilic'], allergens: ['Gluten', 'Lactose'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80b002?w=400&h=300&fit=crop', isAvailable: true, isFeatured: true, sortOrder: 0, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-2', restaurantId, categoryId: 'cat-pizza', name: 'Pizza 4 Fromages', nameEn: 'Four Cheese Pizza', nameAr: 'بيتزا أربعة أجبان',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre', price: 75, ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Chèvre'], allergens: ['Gluten', 'Lactose'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', isAvailable: true, isFeatured: true, sortOrder: 1, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-3', restaurantId, categoryId: 'cat-burgers', name: 'Burger Classic', nameEn: 'Classic Burger', nameAr: 'برغر كلاسيك',
    description: 'Steak haché, cheddar, salade, tomate', price: 55, ingredients: ['Bœuf', 'Cheddar', 'Salade', 'Tomate'], allergens: ['Gluten', 'Lactose'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', isAvailable: true, isFeatured: false, sortOrder: 0, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-4', restaurantId, categoryId: 'cat-tacos', name: 'Tacos Poulet', nameEn: 'Chicken Tacos', nameAr: 'تاكوس دجاج',
    description: 'Poulet grillé, sauce blanche, frites', price: 45, ingredients: ['Poulet', 'Sauce blanche', 'Frites'], allergens: ['Gluten'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', isAvailable: true, isFeatured: false, sortOrder: 0, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-5', restaurantId, categoryId: 'cat-drinks', name: 'Jus d\'Orange Frais', nameEn: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج',
    description: 'Pressé minute', price: 25, ingredients: ['Orange'], allergens: [],
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop', isAvailable: true, isFeatured: false, sortOrder: 0, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-6', restaurantId, categoryId: 'cat-desserts', name: 'Tiramisu', nameEn: 'Tiramisu', nameAr: 'تيراميسو',
    description: 'Classique italien au café', price: 35, ingredients: ['Mascarpone', 'Café', 'Cacao'], allergens: ['Gluten', 'Lactose', 'Œufs'],
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', isAvailable: true, isFeatured: true, sortOrder: 0, createdAt: now, updatedAt: now,
  },
];

export const DEMO_ORDERS: Order[] = [
  {
    id: 'order-1', restaurantId, orderNumber: 'ORD-1248', customerName: 'Karim A.', items: [{ productId: 'prod-1', name: 'Pizza Margherita', price: 65, quantity: 2 }],
    status: 'PENDING', type: 'DINE_IN', tableNumber: 5, subtotal: 130, tax: 13, total: 143, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), updatedAt: now,
  },
  {
    id: 'order-2', restaurantId, orderNumber: 'ORD-1247', customerName: 'Sara M.', items: [{ productId: 'prod-3', name: 'Burger Classic', price: 55, quantity: 1 }, { productId: 'prod-5', name: 'Jus d\'Orange', price: 25, quantity: 2 }],
    status: 'PREPARING', type: 'DINE_IN', tableNumber: 12, subtotal: 105, tax: 10.5, total: 115.5, createdAt: new Date(Date.now() - 15 * 60000).toISOString(), updatedAt: now,
  },
  {
    id: 'order-3', restaurantId, orderNumber: 'ORD-1246', customerName: 'Youssef B.', items: [{ productId: 'prod-2', name: 'Pizza 4 Fromages', price: 75, quantity: 1 }],
    status: 'READY', type: 'TAKEAWAY', subtotal: 75, tax: 7.5, total: 82.5, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), updatedAt: now,
  },
  {
    id: 'order-4', restaurantId, orderNumber: 'ORD-1245', customerName: 'Fatima L.', items: [{ productId: 'prod-4', name: 'Tacos Poulet', price: 45, quantity: 3 }],
    status: 'SERVED', type: 'DINE_IN', tableNumber: 3, subtotal: 135, tax: 13.5, total: 148.5, createdAt: new Date(Date.now() - 60 * 60000).toISOString(), updatedAt: now,
  },
];

export const DEMO_RESERVATIONS: Reservation[] = [
  { id: 'res-1', restaurantId, customerName: 'Mohamed K.', customerPhone: '+212 612 345 678', guests: 4, date: '2026-06-25', time: '20:00', status: 'PENDING', createdAt: now, updatedAt: now },
  { id: 'res-2', restaurantId, customerName: 'Amina R.', customerPhone: '+212 698 765 432', guests: 2, date: '2026-06-26', time: '19:30', status: 'CONFIRMED', createdAt: now, updatedAt: now },
];

export const DEMO_CUSTOMERS: Customer[] = [
  { id: 'cust-1', restaurantId, name: 'Karim Alaoui', phone: '+212 612 111 222', email: 'karim@email.com', totalOrders: 12, totalSpent: 1450, loyaltyPoints: 145, lastVisitAt: now, createdAt: now, updatedAt: now },
  { id: 'cust-2', restaurantId, name: 'Sara Mansouri', phone: '+212 698 333 444', email: 'sara@email.com', totalOrders: 8, totalSpent: 920, loyaltyPoints: 92, lastVisitAt: now, createdAt: now, updatedAt: now },
  { id: 'cust-3', restaurantId, name: 'Youssef Benjelloun', phone: '+212 655 555 666', totalOrders: 5, totalSpent: 580, loyaltyPoints: 58, createdAt: now, updatedAt: now },
];

export const DEMO_SUBSCRIPTION: Subscription = {
  id: 'sub-1', restaurantId, plan: 'PREMIUM', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-12-31', amount: 499, createdAt: now, updatedAt: now,
};

export const DEMO_QR_CODES: QRCode[] = [
  { id: 'qr-main', restaurantId, type: 'MAIN', url: 'https://menuflow.ma/r/le-gourmet', createdAt: now },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `qr-table-${i + 1}`,
    restaurantId,
    type: 'TABLE' as const,
    tableNumber: i + 1,
    url: `https://menuflow.ma/r/le-gourmet?t=${i + 1}`,
    createdAt: now,
  })),
];

function generateVisitsData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      visits: Math.floor(80 + Math.random() * 120),
      orders: Math.floor(5 + Math.random() * 20),
      revenue: Math.floor(500 + Math.random() * 2000),
    });
  }
  return data;
}

export const DEMO_VISITS_CHART = generateVisitsData();

export const DEMO_DASHBOARD_STATS: DashboardStats = {
  qrScans: 1248,
  menuVisits: 3682,
  orders: 256,
  revenue: 12850,
  uniqueCustomers: 892,
  qrScansGrowth: 12.5,
  menuVisitsGrowth: 8.3,
  ordersGrowth: 15.2,
  revenueGrowth: 18.7,
  customersGrowth: 6.4,
  pendingOrders: 8,
  pendingReservations: 3,
};

export const DEMO_PLATFORM_STATS: PlatformStats = {
  totalRestaurants: 47,
  activeRestaurants: 42,
  totalOrders: 12847,
  totalRevenue: 2847500,
  activeSubscriptions: 38,
  newRestaurantsThisMonth: 5,
};

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', userId: 'demo-super-admin', userName: 'Hamza Ouzeroual', action: 'CREATE', resource: 'restaurant', resourceId: restaurantId, details: { name: 'Le Gourmet' }, createdAt: now },
  { id: 'log-2', userId: 'demo-owner', userName: 'Ahmed Benali', action: 'UPDATE', resource: 'product', resourceId: 'prod-1', details: { field: 'price' }, createdAt: now },
  { id: 'log-3', userId: 'demo-super-admin', userName: 'Hamza Ouzeroual', action: 'CREATE', resource: 'user', resourceId: 'demo-owner', createdAt: now },
];

export const DEMO_RESTAURANTS: Restaurant[] = [
  DEMO_RESTAURANT,
  {
    id: 'demo-restaurant-2', restaurantId: 'demo-restaurant-2', name: 'Dar Tajine', slug: 'dar-tajine', city: 'Marrakech',
    status: 'ACTIVE', subscriptionPlan: 'BASIC', subscriptionExpiresAt: '2026-08-31T23:59:59.000Z',
    settings: DEMO_RESTAURANT.settings, createdAt: now, updatedAt: now,
  },
  {
    id: 'demo-restaurant-3', restaurantId: 'demo-restaurant-3', name: 'Ocean View', slug: 'ocean-view', city: 'Agadir',
    status: 'SUSPENDED', subscriptionPlan: 'FREE',
    settings: DEMO_RESTAURANT.settings, createdAt: now, updatedAt: now,
  },
];

export function getDemoAnalytics(restaurantId: string): AnalyticsEvent[] {
  return DEMO_VISITS_CHART.map((d, i) => ({
    id: `analytics-${i}`,
    restaurantId,
    type: 'MENU_VISIT' as const,
    value: d.visits,
    date: d.date,
    createdAt: d.date,
  }));
}
