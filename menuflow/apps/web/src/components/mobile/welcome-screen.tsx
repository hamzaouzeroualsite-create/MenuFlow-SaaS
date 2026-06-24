'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n-context';
import { t } from '@/lib/i18n';
import type { Restaurant, Language } from '@/types';

interface Props {
  restaurant: Restaurant;
  onContinue: () => void;
}

const languages: { code: Language; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

export function WelcomeScreen({ restaurant, onContinue }: Props) {
  const { lang, setLang } = useI18n();

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: restaurant.coverImage
            ? `url(${restaurant.coverImage})`
            : 'linear-gradient(135deg, #065f46 0%, #10B981 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-white text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
          {restaurant.logo ? (
            <img src={restaurant.logo} alt={restaurant.name} className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <span className="text-3xl font-bold">{restaurant.name.charAt(0)}</span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-white/80 mb-8">{t(lang, 'welcome')}</p>

        <Button
          onClick={onContinue}
          className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl shadow-lg"
        >
          {t(lang, 'discoverMenu')}
        </Button>

        <div className="mt-8 flex items-center gap-2">
          <Globe className="w-4 h-4 text-white/60" />
          <div className="flex gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  lang === l.code ? 'bg-white text-emerald-700 font-medium' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
