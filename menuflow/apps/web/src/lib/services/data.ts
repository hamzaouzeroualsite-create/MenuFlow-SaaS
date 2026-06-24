import type {
  Restaurant,
  User,
  Category,
  Product,
  Order,
  Reservation,
  Customer,
  Subscription,
  DashboardStats,
  PlatformStats,
  AuditLog,
  QRCode,
  AnalyticsEvent,
  OrderStatus,
  ReservationStatus,
  RestaurantStatus,
} from '@/types';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import {
  COLLECTIONS,
  getDocument,
  getDocuments,
  getByRestaurantId,
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  createAuditLog,
  orderBy,
  where,
  limit,
} from '@/lib/firebase/firestore';
import {
  DEMO_RESTAURANT,
  DEMO_RESTAURANTS,
  DEMO_USERS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_ORDERS,
  DEMO_RESERVATIONS,
  DEMO_CUSTOMERS,
  DEMO_SUBSCRIPTION,
  DEMO_QR_CODES,
  DEMO_DASHBOARD_STATS,
  DEMO_PLATFORM_STATS,
  DEMO_AUDIT_LOGS,
  DEMO_VISITS_CHART,
} from '@/lib/demo/data';

let demoOrders = [...DEMO_ORDERS];

// Restaurants
export async function getRestaurants(): Promise<Restaurant[]> {
  if (!isFirebaseConfigured) return DEMO_RESTAURANTS;
  return getDocuments<Restaurant>(COLLECTIONS.restaurants, [orderBy('createdAt', 'desc')]);
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  if (!isFirebaseConfigured) return DEMO_RESTAURANTS.find((r) => r.id === id) ?? null;
  return getDocument<Restaurant>(COLLECTIONS.restaurants, id);
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  if (!isFirebaseConfigured) return slug === 'le-gourmet' ? DEMO_RESTAURANT : null;
  const results = await getDocuments<Restaurant>(COLLECTIONS.restaurants, [where('slug', '==', slug), limit(1)]);
  return results[0] ?? null;
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDocument(COLLECTIONS.restaurants, id, data);
}

// Users
export async function getUsers(): Promise<User[]> {
  if (!isFirebaseConfigured) return DEMO_USERS;
  return getDocuments<User>(COLLECTIONS.users, [orderBy('createdAt', 'desc')]);
}

export async function getUsersByRestaurant(restaurantId: string): Promise<User[]> {
  if (!isFirebaseConfigured) return DEMO_USERS.filter((u) => u.restaurantId === restaurantId);
  return getByRestaurantId<User>(COLLECTIONS.users, restaurantId);
}

// Categories
export async function getCategories(restaurantId: string): Promise<Category[]> {
  if (!isFirebaseConfigured) return DEMO_CATEGORIES.filter((c) => c.restaurantId === restaurantId);
  return getByRestaurantId<Category>(COLLECTIONS.categories, restaurantId, [orderBy('sortOrder', 'asc')]);
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!isFirebaseConfigured) return `cat-${Date.now()}`;
  return createDocument(COLLECTIONS.categories, data);
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDocument(COLLECTIONS.categories, id, data);
}

export async function deleteCategory(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  await deleteDocument(COLLECTIONS.categories, id);
}

// Products
export async function getProducts(restaurantId: string): Promise<Product[]> {
  if (!isFirebaseConfigured) return DEMO_PRODUCTS.filter((p) => p.restaurantId === restaurantId);
  return getByRestaurantId<Product>(COLLECTIONS.products, restaurantId, [orderBy('sortOrder', 'asc')]);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!isFirebaseConfigured) return `prod-${Date.now()}`;
  return createDocument(COLLECTIONS.products, data);
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDocument(COLLECTIONS.products, id, data);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  await deleteDocument(COLLECTIONS.products, id);
}

// Orders
export async function getOrders(restaurantId: string): Promise<Order[]> {
  if (!isFirebaseConfigured) return demoOrders.filter((o) => o.restaurantId === restaurantId);
  return getByRestaurantId<Order>(COLLECTIONS.orders, restaurantId, [orderBy('createdAt', 'desc')]);
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured) return demoOrders;
  return getDocuments<Order>(COLLECTIONS.orders, [orderBy('createdAt', 'desc'), limit(100)]);
}

export function subscribeToOrders(
  restaurantId: string,
  callback: (orders: Order[]) => void
) {
  if (!isFirebaseConfigured) {
    callback(demoOrders.filter((o) => o.restaurantId === restaurantId));
    return () => {};
  }
  return subscribeToCollection<Order>(
    COLLECTIONS.orders,
    [where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'), limit(50)],
    callback
  );
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!isFirebaseConfigured) {
    const id = `order-${Date.now()}`;
    const now = new Date().toISOString();
    demoOrders.unshift({ ...data, id, createdAt: now, updatedAt: now });
    return id;
  }
  return createDocument(COLLECTIONS.orders, data);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (!isFirebaseConfigured) {
    demoOrders = demoOrders.map((o) => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o);
    return;
  }
  await updateDocument(COLLECTIONS.orders, id, { status });
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDocument(COLLECTIONS.orders, id, data);
}

// Reservations
export async function getReservations(restaurantId: string): Promise<Reservation[]> {
  if (!isFirebaseConfigured) return DEMO_RESERVATIONS.filter((r) => r.restaurantId === restaurantId);
  return getByRestaurantId<Reservation>(COLLECTIONS.reservations, restaurantId, [orderBy('createdAt', 'desc')]);
}

export async function getAllReservations(): Promise<Reservation[]> {
  if (!isFirebaseConfigured) return DEMO_RESERVATIONS;
  return getDocuments<Reservation>(COLLECTIONS.reservations, [orderBy('createdAt', 'desc'), limit(100)]);
}

export async function createReservation(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!isFirebaseConfigured) return `res-${Date.now()}`;
  return createDocument(COLLECTIONS.reservations, data);
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDocument(COLLECTIONS.reservations, id, { status });
}

// Customers
export async function getCustomers(restaurantId: string): Promise<Customer[]> {
  if (!isFirebaseConfigured) return DEMO_CUSTOMERS.filter((c) => c.restaurantId === restaurantId);
  return getByRestaurantId<Customer>(COLLECTIONS.customers, restaurantId, [orderBy('totalSpent', 'desc')]);
}

// Subscriptions
export async function getSubscription(restaurantId: string): Promise<Subscription | null> {
  if (!isFirebaseConfigured) return DEMO_SUBSCRIPTION;
  const results = await getByRestaurantId<Subscription>(COLLECTIONS.subscriptions, restaurantId, [limit(1)]);
  return results[0] ?? null;
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  if (!isFirebaseConfigured) return [DEMO_SUBSCRIPTION];
  return getDocuments<Subscription>(COLLECTIONS.subscriptions, [orderBy('createdAt', 'desc')]);
}

// QR Codes
export async function getQRCodes(restaurantId: string): Promise<QRCode[]> {
  if (!isFirebaseConfigured) return DEMO_QR_CODES.filter((q) => q.restaurantId === restaurantId);
  return getByRestaurantId<QRCode>(COLLECTIONS.qrCodes, restaurantId);
}

// Analytics
export async function getDashboardStats(restaurantId: string): Promise<DashboardStats> {
  if (!isFirebaseConfigured) return DEMO_DASHBOARD_STATS;
  const analytics = await getByRestaurantId<AnalyticsEvent>(COLLECTIONS.analytics, restaurantId);
  const orders = await getOrders(restaurantId);
  const customers = await getCustomers(restaurantId);
  const revenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0);
  return {
    qrScans: analytics.filter((a) => a.type === 'QR_SCAN').reduce((s, a) => s + a.value, 0) || 0,
    menuVisits: analytics.filter((a) => a.type === 'MENU_VISIT').reduce((s, a) => s + a.value, 0) || 0,
    orders: orders.length,
    revenue,
    uniqueCustomers: customers.length,
    qrScansGrowth: 12.5,
    menuVisitsGrowth: 8.3,
    ordersGrowth: 15.2,
    revenueGrowth: 18.7,
    customersGrowth: 6.4,
    pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
    pendingReservations: (await getReservations(restaurantId)).filter((r) => r.status === 'PENDING').length,
  };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  if (!isFirebaseConfigured) return DEMO_PLATFORM_STATS;
  const restaurants = await getRestaurants();
  const orders = await getAllOrders();
  const subs = await getAllSubscriptions();
  return {
    totalRestaurants: restaurants.length,
    activeRestaurants: restaurants.filter((r) => r.status === 'ACTIVE').length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + o.total, 0),
    activeSubscriptions: subs.filter((s) => s.status === 'ACTIVE').length,
    newRestaurantsThisMonth: restaurants.length,
  };
}

export function getVisitsChartData() {
  return DEMO_VISITS_CHART;
}

export function getOrderDistribution() {
  return [
    { name: 'Sur place', value: 45, color: '#10B981' },
    { name: 'À emporter', value: 30, color: '#3B82F6' },
    { name: 'Livraison', value: 15, color: '#F97316' },
    { name: 'Réservation', value: 10, color: '#8B5CF6' },
  ];
}

export function getPopularDishes(restaurantId: string) {
  if (!isFirebaseConfigured) {
    return [
      { name: 'Pizza Margherita', orders: 156, image: DEMO_PRODUCTS[0].image },
      { name: 'Burger Classic', orders: 124, image: DEMO_PRODUCTS[2].image },
      { name: 'Tacos Poulet', orders: 98, image: DEMO_PRODUCTS[3].image },
      { name: 'Tiramisu', orders: 87, image: DEMO_PRODUCTS[5].image },
    ];
  }
  return [];
}

// Audit Logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  if (!isFirebaseConfigured) return DEMO_AUDIT_LOGS;
  return getDocuments<AuditLog>(COLLECTIONS.auditLogs, [orderBy('createdAt', 'desc'), limit(100)]);
}

export async function logAction(entry: {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  restaurantId?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  await createAuditLog(entry);
}

export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
) {
  if (!isFirebaseConfigured) {
    const order = demoOrders.find((o) => o.id === orderId) ?? null;
    callback(order);
    return () => {};
  }
  return subscribeToCollection<Order>(
    COLLECTIONS.orders,
    [where('__name__', '==', orderId)],
    (orders) => callback(orders[0] ?? null)
  );
}
