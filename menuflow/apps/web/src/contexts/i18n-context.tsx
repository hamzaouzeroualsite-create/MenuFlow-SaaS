'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language } from '@/types';

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, defaultLang = 'fr' }: { children: ReactNode; defaultLang?: Language }) {
  const [lang, setLang] = useState<Language>(defaultLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, dir }}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
