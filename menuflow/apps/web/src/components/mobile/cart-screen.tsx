'use client';

import { useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/i18n-context';
import { useCartStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import { createOrder } from '@/lib/services/data';
import type { Restaurant } from '@/types';

interface Props {
  restaurant: Restaurant;
  tableNumber?: number;
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export function CartScreen({ restaurant, tableNumber, onBack, onOrderPlaced }: Props) {
  const { lang } = useI18n();
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();
  const [table, setTable] = useState(tableNumber?.toString() || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const subtotal = total();
      const tax = subtotal * 0.1;
      const orderId = await createOrder({
        restaurantId: restaurant.id,
        orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
        items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        status: 'PENDING',
        type: 'DINE_IN',
        tableNumber: table ? parseInt(table) : undefined,
        notes: notes || undefined,
        subtotal,
        tax,
        total: subtotal + tax,
        estimatedTime: 15,
      });
      clearCart();
      onOrderPlaced(orderId);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white px-4 py-4 flex items-center gap-3 border-b">
          <button onClick={onBack}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-lg">{t(lang, 'cart')}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">{t(lang, 'emptyCart')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b">
        <button onClick={onBack}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-lg">{t(lang, 'cart')}</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-emerald-600 font-semibold text-sm">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-full border flex items-center justify-center">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">{t(lang, 'tableNumber')}</label>
            <Select value={table} onValueChange={setTable}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: restaurant.settings.tableCount || 20 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>Table {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t(lang, 'notes')}</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>
      </div>

      <div className="bg-white border-t p-4 space-y-3">
        <div className="flex justify-between text-lg font-bold">
          <span>{t(lang, 'orderTotal')}</span>
          <span className="text-emerald-600">{formatCurrency(total() * 1.1)}</span>
        </div>
        <Button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg rounded-xl">
          {loading ? '...' : t(lang, 'placeOrder')}
        </Button>
      </div>
    </div>
  );
}
