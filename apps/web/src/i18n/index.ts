import type { Locale } from './types';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

const LOCALES: Record<Locale, typeof zhCN> = { 'zh-CN': zhCN, en };

const COOKIE_NAME = 'webrex_lang';

export function getLocaleFromCookie(request?: Request): Locale {
  if (request) {
    const cookie = request.headers.get('Cookie') ?? '';
    const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match && match[1] in LOCALES) return match[1] as Locale;
  }
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match && match[1] in LOCALES) return match[1] as Locale;
  }
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language;
    if (lang.startsWith('zh')) return 'zh-CN';
  }
  return 'zh-CN';
}

export function setLocaleCookie(locale: Locale) {
  // biome-ignore lint/suspicious/noDocumentCookie: cookie is the simplest cross-browser way to persist locale preference
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = LOCALES[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  if (typeof value === 'string') return value;
  const fallback: any = LOCALES['zh-CN'];
  for (const k of keys) {
    value = fallback?.[k];
  }
  return typeof value === 'string' ? value : key;
}

export function getTranslations(locale: Locale) {
  return LOCALES[locale];
}
