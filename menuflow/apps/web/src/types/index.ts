export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'MANAGER' | 'EMPLOYEE';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

export type RestaurantStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'RESERVATION';

export type Language = 'fr' | 'en' | 'ar';

export interface Restaurant {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
  status: RestaurantStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  settings: RestaurantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantSettings {
  theme: { primaryColor: string; secondaryColor: string; accentColor: string };
  languages: Language[];
  defaultLanguage: Language;
  taxes: { name: string; rate: number }[];
  deliveryFee: number;
  tableCount: number;
  currency: string;
  notifications: { email: boolean; sms: boolean; push: boolean; sound: boolean };
}

export interface User {
  id: string;
  restaurantId?: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  promotionPrice?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  type: OrderType;
  tableNumber?: number;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guests: number;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  restaurantId: string;
  name: string;
  phone?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisitAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  customerId?: string;
  orderId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  restaurantId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  restaurantId: string;
  type: 'QR_SCAN' | 'MENU_VISIT' | 'ORDER' | 'REVENUE' | 'CUSTOMER';
  value: number;
  metadata?: Record<string, unknown>;
  date: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  restaurantId?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  restaurantId?: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface QRCode {
  id: string;
  restaurantId: string;
  type: 'MAIN' | 'TABLE';
  tableNumber?: number;
  url: string;
  createdAt: string;
}

export interface DashboardStats {
  qrScans: number;
  menuVisits: number;
  orders: number;
  revenue: number;
  uniqueCustomers: number;
  qrScansGrowth: number;
  menuVisitsGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
  pendingOrders: number;
  pendingReservations: number;
}

export interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newRestaurantsThisMonth: number;
}
