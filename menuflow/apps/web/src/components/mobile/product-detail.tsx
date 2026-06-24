'use client';

import { useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { useCartStore } from '@/lib/store';
import { t, getProductName } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product: Product;
  onBack: () => void;
  onAdded: () => void;
}

export function ProductDetail({ product, onBack, onAdded }: Props) {
  const { lang } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: getProductName(product, lang),
      price: product.promotionPrice ?? product.price,
      quantity,
      image: product.image,
    });
    onAdded();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-64 bg-gray-100">
        {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-6 -mt-6 relative bg-white rounded-t-3xl">
        <h1 className="text-2xl font-bold text-gray-900">{getProductName(product, lang)}</h1>
        <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(product.price)}</p>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed">{product.description}</p>

        {product.ingredients.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{t(lang, 'ingredients')}</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span key={ing} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{ing}</span>
              ))}
            </div>
          </div>
        )}

        {product.allergens.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{t(lang, 'allergens')}</h3>
            <div className="flex flex-wrap gap-2">
              {product.allergens.map((a) => (
                <span key={a} className="px-3 py-1 bg-red-50 rounded-full text-xs text-red-600">{a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{t(lang, 'quantity')}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 py-6 text-lg rounded-xl">
          {t(lang, 'addToCart')} — {formatCurrency((product.promotionPrice ?? product.price) * quantity)}
        </Button>
      </div>
    </div>
  );
}
