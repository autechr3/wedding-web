import { createContext, useContext } from 'react';
import type { Locale } from '../lib/dateFormat';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
