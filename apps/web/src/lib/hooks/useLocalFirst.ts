import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Type for a sync endpoint. Receives the locally queued items, returns
 * `true` if the sync succeeded (so the local queue can be cleared).
 */
export type SyncFn<T> = (items: T[]) => Promise<boolean>;

interface UseLocalFirstOpts<T> {
  /** localStorage key. */
  storageKey: string;
  /** Max items to keep in local queue. Drops oldest first. */
  maxItems?: number;
  /** Called to sync queued items to the server. */
  syncFn?: SyncFn<T>;
  /** If true, auto-sync on mount. Default true. */
  syncOnMount?: boolean;
}

interface UseLocalFirstResult<T> {
  /** Current locally queued items. */
  queue: T[];
  /** Append one item to the local queue. */
  append(item: T): void;
  /** Read and return current items without clearing. */
  readAll(): T[];
  /** Clear the local queue. */
  clear(): void;
  /** Manually trigger a sync. Returns true on success. */
  sync(): Promise<boolean>;
  /** Whether a sync is in flight. */
  syncing: boolean;
}

function readStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, items: T[], maxItems: number): void {
  if (typeof window === 'undefined') return;
  try {
    const capped = items.length > maxItems ? items.slice(items.length - maxItems) : items;
    window.localStorage.setItem(key, JSON.stringify(capped));
  } catch {
    // quota / private mode — silently drop
  }
}

/**
 * Generic local-first data layer.
 *
 * Append items locally (survives refresh), then sync to the server when
 * the user is authenticated. Perfect for anonymous→logged-in data merge
 * patterns like bookmarks, notes, progress, preferences.
 *
 * @example
 * const { queue, append, sync } = useLocalFirst<Attempt>({
 *   storageKey: 'myapp:attempts:v1',
 *   maxItems: 500,
 *   syncFn: async (items) => {
 *     const res = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(items) });
 *     return res.ok;
 *   },
 * });
 */
export function useLocalFirst<T>(opts: UseLocalFirstOpts<T>): UseLocalFirstResult<T> {
  const { storageKey, maxItems = 1000, syncFn, syncOnMount = true } = opts;
  const [queue, setQueue] = useState<T[]>(() => readStore<T>(storageKey));
  const [syncing, setSyncing] = useState(false);
  const syncedOnce = useRef(false);

  const persist = useCallback(
    (items: T[]) => {
      setQueue(items);
      writeStore(storageKey, items, maxItems);
    },
    [storageKey, maxItems],
  );

  const append = useCallback(
    (item: T) => {
      setQueue((prev) => {
        const next = [...prev, item];
        writeStore(storageKey, next, maxItems);
        return next;
      });
    },
    [storageKey, maxItems],
  );

  const readAll = useCallback(() => {
    return readStore<T>(storageKey);
  }, [storageKey]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const sync = useCallback(async (): Promise<boolean> => {
    if (!syncFn) return true;
    const items = readStore<T>(storageKey);
    if (items.length === 0) return true;
    setSyncing(true);
    try {
      const ok = await syncFn(items);
      if (ok) {
        persist([]);
      }
      return ok;
    } catch {
      return false;
    } finally {
      setSyncing(false);
    }
  }, [syncFn, storageKey, persist]);

  // Auto-sync on mount
  useEffect(() => {
    if (syncedOnce.current || !syncOnMount || !syncFn) return;
    syncedOnce.current = true;
    sync();
  }, [syncOnMount, syncFn, sync]);

  return { queue, append, readAll, clear, sync, syncing };
}
