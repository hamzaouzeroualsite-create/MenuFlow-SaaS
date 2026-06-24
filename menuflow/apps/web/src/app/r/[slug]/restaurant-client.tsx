'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nProvider } from '@/contexts/i18n-context';
import { getRestaurantBySlug, getCategories, getProducts } from '@/lib/services/data';
import type { Restaurant, Category, Product } from '@/types';
import { WelcomeScreen } from '@/components/mobile/welcome-screen';
import { MenuScreen } from '@/components/mobile/menu-screen';
import { ProductDetail } from '@/components/mobile/product-detail';
import { CartScreen } from '@/components/mobile/cart-screen';
import { OrderConfirmation } from '@/components/mobile/order-confirmation';
import { OrderTracking } from '@/components/mobile/order-tracking';

type Screen = 'welcome' | 'menu' | 'product' | 'cart' | 'confirmation' | 'tracking';

export default function RestaurantPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const tableNumber = searchParams.get('t') ? parseInt(searchParams.get('t')!) : undefined;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getRestaurantBySlug(slug);
      if (!r) { setLoading(false); return; }
      setRestaurant(r);
      const [cats, prods] = await Promise.all([getCategories(r.id), getProducts(r.id)]);
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Restaurant introuvable</p>
      </div>
    );
  }

  return (
    <I18nProvider defaultLang={restaurant.settings.defaultLanguage}>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WelcomeScreen restaurant={restaurant} onContinue={() => setScreen('menu')} />
            </motion.div>
          )}
          {screen === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MenuScreen
                restaurant={restaurant}
                categories={categories}
                products={products}
                onSelectProduct={(p) => { setSelectedProduct(p); setScreen('product'); }}
                onOpenCart={() => setScreen('cart')}
              />
            </motion.div>
          )}
          {screen === 'product' && selectedProduct && (
            <motion.div key="product" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <ProductDetail
                product={selectedProduct}
                onBack={() => setScreen('menu')}
                onAdded={() => setScreen('menu')}
              />
            </motion.div>
          )}
          {screen === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <CartScreen
                restaurant={restaurant}
                tableNumber={tableNumber}
                onBack={() => setScreen('menu')}
                onOrderPlaced={(id) => { setOrderId(id); setScreen('confirmation'); }}
              />
            </motion.div>
          )}
          {screen === 'confirmation' && orderId && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <OrderConfirmation
                orderId={orderId}
                onTrack={() => setScreen('tracking')}
              />
            </motion.div>
          )}
          {screen === 'tracking' && orderId && (
            <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <OrderTracking orderId={orderId} onBack={() => setScreen('menu')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </I18nProvider>
  );
}
