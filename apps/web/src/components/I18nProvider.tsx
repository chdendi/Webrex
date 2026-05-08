import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Locale } from '~/i18n/types';
import { getLocaleFromCookie, setLocaleCookie, t } from '~/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-CN',
  setLocale: () => {},
  t: (key: string) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    return getLocaleFromCookie();
  });

  useEffect(() => {
    setLocaleCookie(locale);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const translate = useCallback(
    (key: string) => {
      return t(locale, key);
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t: translate }}>{children}</I18nContext.Provider>;
}
