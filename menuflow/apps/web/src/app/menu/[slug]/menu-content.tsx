'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, ShoppingCart, Star, Plus, Minus, X,
  Clock, Leaf, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  promotionPrice?: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  calories?: number;
  featured: boolean;
  preparationTime: number;
}

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  products: Product[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  currency: string;
  categories: Category[];
}

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function MenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const tableNumber = searchParams.get('table');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('fr');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { items, addItem, updateQuantity, total, itemCount, setRestaurant: setCartRestaurant, clearCart } = useCartStore();

  useEffect(() => {
    api.get<Restaurant>(`/api/restaurants/slug/${slug}`)
      .then((data) => {
        setRestaurant(data);
        setCartRestaurant(slug);
        if (data.categories.length > 0) setActiveCategory(data.categories[0].id);
        api.post(`/api/restaurants/${data.id}/scan`, { tableId: tableNumber }).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, tableNumber, setCartRestaurant]);

  const getProductName = (p: Product) => {
    if (lang === 'ar' && p.nameAr) return p.nameAr;
    return p.name;
  };

  const filteredProducts = restaurant?.categories
    .flatMap((c) => c.products.map((p) => ({ ...p, categoryId: c.id })))
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.promotionPrice || product.price),
      quantity,
    });
    setSelectedProduct(null);
  };

  const handleCheckout = async () => {
    if (!restaurant || items.length === 0) return;
    try {
      const order = await api.post(`/api/restaurants/${restaurant.id}/orders`, {
        customerName: 'Client',
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, notes: i.notes })),
        paymentMethod: 'CASH',
      });
      clearCart();
      setShowCart(false);
      alert(`Commande ${(order as { orderNumber: string }).orderNumber} envoyée !`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Restaurant non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            {tableNumber && <p className="text-emerald-100 text-sm">Table {tableNumber}</p>}
          </div>
        </div>

        <div className="p-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un plat..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 rounded-lg border text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {!search && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {(search ? filteredProducts : restaurant.categories.find((c) => c.id === activeCategory)?.products || []).map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border flex gap-4 cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="w-20 h-20 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl font-bold text-emerald-600 flex-shrink-0">
              {product.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{getProductName(product)}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                  )}
                </div>
                {product.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {product.promotionPrice ? (
                    <>
                      <span className="font-bold text-emerald-600">{formatCurrency(Number(product.promotionPrice))}</span>
                      <span className="text-sm text-gray-400 line-through">{formatCurrency(Number(product.price))}</span>
                    </>
                  ) : (
                    <span className="font-bold">{formatCurrency(Number(product.price))}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setSelectedProduct(null)}>
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-48 bg-emerald-50 flex items-center justify-center text-6xl font-bold text-emerald-600">
              {selectedProduct.name.charAt(0)}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold">{getProductName(selectedProduct)}</h2>
              <p className="text-gray-600 mt-2">{selectedProduct.description}</p>

              {selectedProduct.ingredients.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium flex items-center gap-1"><Leaf className="w-4 h-4" /> Ingrédients</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedProduct.ingredients.join(', ')}</p>
                </div>
              )}

              {selectedProduct.allergens.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium flex items-center gap-1 text-orange-600">
                    <AlertTriangle className="w-4 h-4" /> Allergènes
                  </p>
                  <p className="text-sm text-gray-500">{selectedProduct.allergens.join(', ')}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {selectedProduct.calories && <span>{selectedProduct.calories} cal</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedProduct.preparationTime} min</span>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(Number(selectedProduct.promotionPrice || selectedProduct.price))}
                </span>
                <Button size="lg" onClick={() => handleAddToCart(selectedProduct)} className="gap-2">
                  <Plus className="w-5 h-5" /> Ajouter au panier
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {itemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-40">
          <Button className="w-full h-14 text-lg gap-3" onClick={() => setShowCart(true)}>
            <ShoppingCart className="w-5 h-5" />
            Voir le panier ({itemCount()}) &middot; {formatCurrency(total())}
          </Button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowCart(false)}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Votre commande</h2>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-emerald-600">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span className="text-emerald-600">{formatCurrency(total())}</span>
              </div>
              <Button className="w-full h-12 text-lg" onClick={handleCheckout}>
                Commander
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="text-center py-4 text-xs text-gray-400">
        Powered by <span className="font-medium text-emerald-600">MenuFlow</span>
      </div>
    </div>
  );
}
