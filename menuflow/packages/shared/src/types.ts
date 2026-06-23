export interface RestaurantSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  languages: string[];
  defaultLanguage: string;
  taxes: { name: string; rate: number }[];
  deliveryFee: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    sound: boolean;
  };
}

export interface OpeningHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export interface DashboardStats {
  totalScans: number;
  totalOrders: number;
  revenue: number;
  activeCustomers: number;
  conversionRate: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  pendingReservations: number;
}

export interface AnalyticsData {
  revenueChart: { date: string; revenue: number; orders: number }[];
  popularProducts: { id: string; name: string; quantity: number; revenue: number }[];
  peakHours: { hour: number; orders: number }[];
  customerRetention: { month: string; newCustomers: number; returning: number }[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

export interface SocketEvents {
  'order:new': { orderId: string; restaurantId: string };
  'order:updated': { orderId: string; status: string; restaurantId: string };
  'reservation:new': { reservationId: string; restaurantId: string };
  'notification': { type: string; message: string; restaurantId: string };
}
