/**
 * Anonymous-progress local store.
 *
 * While the user is signed out, /api/attempts short-circuits and persists
 * nothing. We mirror every attempt into localStorage so that, on next sign-in,
 * we can POST the queue to /api/progress/sync and back-fill the database.
 *
 * Storage key holds a single JSON object:
 *   { attempts: LocalAttempt[], completions: LocalCompletion[] }
 *
 * All accessors are SSR-safe (return empty / no-op when window is undefined)
 * and never throw — losing anonymous progress is bad, but crashing the app
 * because of a quota error or a corrupted blob is worse.
 */

const STORAGE_KEY = 'webrex:progress:v1';
const MAX_ATTEMPTS = 1000;

export type LocalAttempt = {
  lessonId: string;
  stepId: string;
  tier: 'hard' | 'soft' | 'self' | 'choice';
  confidence: 'high' | 'mid' | 'low' | null;
  passed: boolean;
  durationMs: number | null;
  /** Epoch ms recorded on the client at attempt time. Used as a stable
   *  ordering key when syncing and a soft idempotency hint. */
  ts: number;
};

export type LocalCompletion = {
  lessonId: string;
  ts: number;
};

interface Store {
  attempts: LocalAttempt[];
  completions: LocalCompletion[];
}

function emptyStore(): Store {
  return { attempts: [], completions: [] };
}

function readStore(): Store {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      completions: Array.isArray(parsed.completions) ? parsed.completions : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded / private mode / disabled storage — silently drop.
  }
}

export function appendAttempt(a: LocalAttempt): void {
  if (typeof window === 'undefined') return;
  const store = readStore();
  store.attempts.push(a);
  // Cap to keep localStorage bounded; drop oldest first.
  if (store.attempts.length > MAX_ATTEMPTS) {
    store.attempts.splice(0, store.attempts.length - MAX_ATTEMPTS);
  }
  writeStore(store);
}

export function readAttempts(): LocalAttempt[] {
  return readStore().attempts;
}

export function clearAttempts(): void {
  if (typeof window === 'undefined') return;
  const store = readStore();
  store.attempts = [];
  writeStore(store);
}

export function appendCompletion(lessonId: string): void {
  if (typeof window === 'undefined') return;
  const store = readStore();
  // De-dupe: a lesson can only complete once locally; keep the earliest ts.
  if (store.completions.some((c) => c.lessonId === lessonId)) return;
  store.completions.push({ lessonId, ts: Date.now() });
  writeStore(store);
}

export function readCompletions(): LocalCompletion[] {
  return readStore().completions;
}

export function clearCompletions(): void {
  if (typeof window === 'undefined') return;
  const store = readStore();
  store.completions = [];
  writeStore(store);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
