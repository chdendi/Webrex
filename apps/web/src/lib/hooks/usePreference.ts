import { useCallback, useEffect, useRef, useState } from 'react';

type StoreFactory<T> = {
  get(): T | null;
  set(value: T): void;
};

function cookieStore<T>(name: string): StoreFactory<T> {
  return {
    get() {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
      return (match?.[1] as T) ?? null;
    },
    set(value: T) {
      if (typeof document === 'undefined') return;
      // biome-ignore lint/suspicious/noDocumentCookie: cookie is the target backend, chosen deliberately
      document.cookie = `${name}=${String(value)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    },
  };
}

function localStorageStore<T>(key: string): StoreFactory<T> {
  return {
    get() {
      if (typeof window === 'undefined') return null;
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    set(value: T) {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota / private mode — silently drop
      }
    },
  };
}

type Backend = 'cookie' | 'localStorage';

/**
 * Generic persistent user preference hook.
 *
 * Reads initial value from the specified backend on mount, then persists
 * every update. Falls back to `fallback` when nothing is stored.
 *
 * @example
 * const [theme, setTheme] = usePreference<'light' | 'dark'>({
 *   key: 'theme',
 *   backend: 'cookie',
 *   fallback: 'light',
 * });
 */
export function usePreference<T>(opts: {
  key: string;
  backend: Backend;
  fallback: T;
  /** Called once on mount with the resolved initial value. */
  onResolve?: (value: T) => void;
}): [T, (value: T) => void] {
  const store: StoreFactory<T> = opts.backend === 'cookie' ? cookieStore(opts.key) : localStorageStore(opts.key);

  const storeRef = useRef(store);
  storeRef.current = store;

  const [value, setValue] = useState<T>(() => {
    const stored = storeRef.current.get();
    const resolved = stored ?? opts.fallback;
    if (opts.onResolve) {
      // Defer so it doesn't block initial render
      setTimeout(() => opts.onResolve?.(resolved), 0);
    }
    return resolved;
  });

  useEffect(() => {
    storeRef.current.set(value);
  }, [value]);

  const set = useCallback((next: T) => {
    setValue(next);
  }, []);

  return [value, set];
}
