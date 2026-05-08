import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '~/lib/supabase/browser';
import { useI18n } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

interface UserInfo {
  avatarUrl: string | null;
  name: string | null;
}

export default function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(
      ({
        data,
      }: {
        data: {
          user: {
            user_metadata?: { avatar_url?: string; full_name?: string; user_name?: string };
            email?: string;
          } | null;
        };
      }) => {
        if (data.user) {
          setUser({
            avatarUrl: data.user.user_metadata?.avatar_url ?? null,
            name:
              data.user.user_metadata?.full_name ??
              data.user.user_metadata?.user_name ??
              data.user.email?.split('@')[0] ??
              null,
          });
        }
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const callback = new URL('/api/auth/callback', window.location.origin);
    callback.searchParams.set('next', window.location.pathname);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: callback.toString() },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full" style={{ background: 'var(--color-surface-muted)' }} />;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden transition-opacity hover:opacity-80"
        style={{ background: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name ?? ''}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : user?.name ? (
          user.name.charAt(0).toUpperCase()
        ) : (
          '?'
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl overflow-hidden z-50"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden shrink-0"
                    style={{ background: 'var(--color-surface-muted)', color: 'var(--color-text-muted)' }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name ?? ''}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (user.name ?? '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {user.name}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {t('auth.signedInAs')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="px-3 py-1.5">
                  <LanguageSwitcher />
                </div>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-muted)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {t('common.signOut')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="py-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="px-3 py-1.5">
                  <LanguageSwitcher />
                </div>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-muted)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  {t('common.signIn')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
