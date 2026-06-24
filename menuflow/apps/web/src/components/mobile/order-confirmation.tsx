'use client';

import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { t } from '@/lib/i18n';

interface Props {
  orderId: string;
  onTrack: () => void;
}

export function OrderConfirmation({ orderId, onTrack }: Props) {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle className="w-14 h-14 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'thankYou')}</h1>
      <p className="text-gray-500 mt-2">{t(lang, 'orderSent')}</p>
      <p className="text-sm text-gray-400 mt-4">
        {t(lang, 'orderNumber')}: <span className="font-mono font-bold text-gray-700">{orderId.slice(-6).toUpperCase()}</span>
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {t(lang, 'estimatedTime')}: 15-20 {t(lang, 'minutes')}
      </p>
      <Button onClick={onTrack} className="mt-8 w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 py-6 rounded-xl">
        {t(lang, 'viewOrders')}
      </Button>
    </div>
  );
}
