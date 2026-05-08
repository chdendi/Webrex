import { useI18n } from './I18nProvider';
import type { Locale } from '~/i18n/types';

const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '中文',
  en: 'English',
};

const FLAGS: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  en: '🇺🇸',
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const cycleLocale = () => {
    const next: Locale = locale === 'zh-CN' ? 'en' : 'zh-CN';
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
      <span>{FLAGS[locale]}</span>
      <span>{LOCALE_LABELS[locale]}</span>
    </button>
  );
}
