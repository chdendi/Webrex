import { useEffect, useRef } from 'react';

/**
 * Hook that calls `handler` when the user clicks outside `ref`.
 * SSR-safe — silently no-ops when `document` is unavailable.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(handler: () => void, enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [handler, enabled]);

  return ref;
}
