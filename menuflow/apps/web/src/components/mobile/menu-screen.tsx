'use client';

import { useState } from 'react';
import { Search, Home, Heart, User, ShoppingBag, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/contexts/i18n-context';
import { useCartStore } from '@/lib/store';
import { t, getProductName, getCategoryName } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { Restaurant, Category, Product } from '@/types';

interface Props {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export function MenuScreen({ restaurant, categories, products, onSelectProduct, onOpenCart }: Props) {
  const { lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const itemCount = useCartStore((s) => s.itemCount());

  const filtered = products.filter((p) => {
    if (!p.isAvailable) return false;
    if (activeCategory !== 'all' && p.categoryId !== activeCategory) return false;
    if (search) {
      const name = getProductName(p, lang).toLowerCase();
      return name.includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-3">{restaurant.name}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t(lang, 'search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-gray-50 border-gray-200"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t(lang, 'all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getCategoryName(cat, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="bg-white rounded-xl p-3 flex gap-3 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{getProductName(product, lang)}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-emerald-600">{formatCurrency(product.price)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {itemCount > 0 && (
        <button
          onClick={onOpenCart}
          className="fixed bottom-20 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </span>
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-3 z-10">
        {[
          { icon: Home, label: t(lang, 'home'), active: true },
          { icon: Search, label: t(lang, 'search') },
          { icon: Heart, label: t(lang, 'favorites') },
          { icon: User, label: t(lang, 'profile') },
        ].map((item) => (
          <button key={item.label} className={`flex flex-col items-center gap-0.5 ${item.active ? 'text-emerald-600' : 'text-gray-400'}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
