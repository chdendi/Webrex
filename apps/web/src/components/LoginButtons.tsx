import { useState } from 'react';
import { getSupabaseBrowserClient } from '~/lib/supabase/browser';

interface Props {
  next?: string;
  initialError?: string | null;
}

export default function LoginButtons({ next, initialError }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const signIn = async () => {
    setPending(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const callback = new URL('/api/auth/callback', window.location.origin);
    if (next) callback.searchParams.set('next', next);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: callback.toString() },
    });
    if (err) {
      setError(err.message);
      setPending(false);
    }
    // On success the browser redirects to GitHub; nothing more to do.
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        type="button"
        disabled={pending}
        onClick={signIn}
        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border-2 text-base font-medium transition-all"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        <span aria-hidden>🐙</span>
        <span>{pending ? 'Redirecting…' : 'Continue with GitHub'}</span>
      </button>

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
