import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from '../lib/dateFormat';
import { STORAGE_KEY } from '../i18n';
import { LocaleContext } from './useLocale';

function applyDir(locale: Locale) {
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const initial = (localStorage.getItem(STORAGE_KEY) as Locale) || 'en';
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => { applyDir(locale); i18n.changeLanguage(locale); }, [locale, i18n]);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
