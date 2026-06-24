import type { Language } from '@/types';

export const translations = {
  fr: {
    welcome: 'Bienvenue !',
    discoverMenu: 'Découvrez notre menu',
    search: 'Rechercher...',
    all: 'Tout',
    addToCart: 'Ajouter au panier',
    cart: 'Panier',
    placeOrder: 'Passer la commande',
    orderTotal: 'Total',
    tableNumber: 'Numéro de table',
    notes: 'Note pour le restaurant',
    thankYou: 'Merci !',
    orderSent: 'Votre commande a été envoyée',
    orderNumber: 'Commande',
    estimatedTime: 'Temps estimé',
    viewOrders: 'Voir mes commandes',
    orderReceived: 'Commande reçue',
    preparing: 'En préparation',
    ready: 'Prête',
    served: 'Servie',
    ingredients: 'Ingrédients',
    allergens: 'Allergènes',
    quantity: 'Quantité',
    home: 'Accueil',
    favorites: 'Favoris',
    profile: 'Profil',
    scanQR: 'Scannez le QR Code',
    scanInstructions: 'Pointez votre caméra vers le QR code sur votre table',
    emptyCart: 'Votre panier est vide',
    minutes: 'min',
  },
  en: {
    welcome: 'Welcome!',
    discoverMenu: 'Discover our menu',
    search: 'Search...',
    all: 'All',
    addToCart: 'Add to cart',
    cart: 'Cart',
    placeOrder: 'Place order',
    orderTotal: 'Total',
    tableNumber: 'Table number',
    notes: 'Note for the restaurant',
    thankYou: 'Thank you!',
    orderSent: 'Your order has been sent',
    orderNumber: 'Order',
    estimatedTime: 'Estimated time',
    viewOrders: 'View my orders',
    orderReceived: 'Order received',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    ingredients: 'Ingredients',
    allergens: 'Allergens',
    quantity: 'Quantity',
    home: 'Home',
    favorites: 'Favorites',
    profile: 'Profile',
    scanQR: 'Scan QR Code',
    scanInstructions: 'Point your camera at the QR code on your table',
    emptyCart: 'Your cart is empty',
    minutes: 'min',
  },
  ar: {
    welcome: 'مرحباً!',
    discoverMenu: 'اكتشف قائمتنا',
    search: 'بحث...',
    all: 'الكل',
    addToCart: 'أضف إلى السلة',
    cart: 'السلة',
    placeOrder: 'تأكيد الطلب',
    orderTotal: 'المجموع',
    tableNumber: 'رقم الطاولة',
    notes: 'ملاحظة للمطعم',
    thankYou: 'شكراً لك!',
    orderSent: 'تم إرسال طلبك',
    orderNumber: 'طلب',
    estimatedTime: 'الوقت المقدر',
    viewOrders: 'عرض طلباتي',
    orderReceived: 'تم استلام الطلب',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    served: 'تم التقديم',
    ingredients: 'المكونات',
    allergens: 'مسببات الحساسية',
    quantity: 'الكمية',
    home: 'الرئيسية',
    favorites: 'المفضلة',
    profile: 'الملف',
    scanQR: 'امسح رمز QR',
    scanInstructions: 'وجه الكاميرا نحو رمز QR على طاولتك',
    emptyCart: 'سلتك فارغة',
    minutes: 'دقيقة',
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}

export function getProductName(
  product: { name: string; nameEn?: string; nameAr?: string },
  lang: Language
): string {
  if (lang === 'ar' && product.nameAr) return product.nameAr;
  if (lang === 'en' && product.nameEn) return product.nameEn;
  return product.name;
}

export function getCategoryName(
  category: { name: string; nameEn?: string; nameAr?: string },
  lang: Language
): string {
  if (lang === 'ar' && category.nameAr) return category.nameAr;
  if (lang === 'en' && category.nameEn) return category.nameEn;
  return category.name;
}
