import { useI18n } from './I18nProvider';
import type { Locale } from '~/i18n/types';
import { usePreference } from '~/lib/hooks/usePreference';

const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
};

const FLAGS: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  en: '🇺🇸',
};

export default function LanguageSwitcher() {
  const { setLocale, t } = useI18n();
  const [preferredLocale, setPreferredLocale] = usePreference<Locale>({
    key: 'webrex_lang',
    backend: 'cookie',
    fallback: 'zh-CN',
  });

  const cycleLocale = () => {
    const next: Locale = preferredLocale === 'zh-CN' ? 'en' : 'zh-CN';
    setPreferredLocale(next);
    setLocale(next);
  };

  return (
    <button
      type="button"
      onClick={cycleLocale}
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors hover:bg-[var(--color-surface-muted)]"
      style={{ color: 'var(--color-text-muted)' }}
      title={t('common.language')}
    >
      <span>{FLAGS[preferredLocale]}</span>
      <span>{LOCALE_LABELS[preferredLocale]}</span>
    </button>
  );
}
