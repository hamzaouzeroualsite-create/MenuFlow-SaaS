'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';
import { t } from '@/lib/i18n';
import { subscribeToOrder } from '@/lib/services/data';
import type { Order, OrderStatus } from '@/types';

interface Props {
  orderId: string;
  onBack: () => void;
}

const steps: { status: OrderStatus; key: 'orderReceived' | 'preparing' | 'ready' | 'served' }[] = [
  { status: 'PENDING', key: 'orderReceived' },
  { status: 'PREPARING', key: 'preparing' },
  { status: 'READY', key: 'ready' },
  { status: 'SERVED', key: 'served' },
];

const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

export function OrderTracking({ orderId, onBack }: Props) {
  const { lang } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    return subscribeToOrder(orderId, setOrder);
  }, [orderId]);

  const currentIdx = order ? statusOrder.indexOf(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b">
        <button onClick={onBack}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-lg">Suivi commande</h1>
      </div>

      <div className="px-6 py-8">
        {order && (
          <p className="text-center text-sm text-gray-500 mb-8">
            {order.orderNumber} — Table {order.tableNumber || '—'}
          </p>
        )}

        <div className="space-y-0">
          {steps.map((step, i) => {
            const stepIdx = statusOrder.indexOf(step.status === 'PENDING' ? 'PENDING' : step.status);
            const isComplete = currentIdx >= stepIdx;
            const isActive = currentIdx === stepIdx;

            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isComplete ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-300'
                  } ${isActive ? 'ring-4 ring-emerald-100' : ''}`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <span className="text-sm">{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-16 ${isComplete ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pt-2 pb-8">
                  <p className={`font-semibold ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>
                    {t(lang, step.key)}
                  </p>
                  {isActive && order && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
