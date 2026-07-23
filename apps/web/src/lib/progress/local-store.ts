/**
 * Progress outbox stored locally until the server acknowledges each event.
 *
 * Every attempt enters this local outbox first. Anonymous attempts wait here
 * until sign-in; authenticated attempts are removed after the direct API write
 * is acknowledged. The same event id makes retries safe.
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
  eventId: string;
  lessonId: string;
  stepId: string;
  tier: 'hard' | 'soft' | 'self' | 'choice';
  confidence: 'high' | 'mid' | 'low' | null;
  passed: boolean;
  durationMs: number | null;
  /** Epoch ms recorded on the client at attempt time. */
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
    const rawAttempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    let migrated = false;
    const attempts = rawAttempts.map((attempt) => {
      if (attempt && typeof attempt === 'object' && typeof attempt.eventId !== 'string') {
        migrated = true;
        return { ...attempt, eventId: crypto.randomUUID() } as LocalAttempt;
      }
      return attempt as LocalAttempt;
    });
    const store = {
      attempts,
      completions: Array.isArray(parsed.completions) ? parsed.completions : [],
    };
    if (migrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
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

export function removeAttempts(eventIds: string[]): void {
  if (typeof window === 'undefined' || eventIds.length === 0) return;
  const acknowledged = new Set(eventIds);
  const store = readStore();
  store.attempts = store.attempts.filter((attempt) => !acknowledged.has(attempt.eventId));
  writeStore(store);
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

export function removeCompletions(completions: LocalCompletion[]): void {
  if (typeof window === 'undefined' || completions.length === 0) return;
  const acknowledged = new Set(completions.map((completion) => `${completion.lessonId}:${completion.ts}`));
  const store = readStore();
  store.completions = store.completions.filter(
    (completion) => !acknowledged.has(`${completion.lessonId}:${completion.ts}`),
  );
  writeStore(store);
}

export function removeCompletion(lessonId: string): void {
  if (typeof window === 'undefined') return;
  const store = readStore();
  store.completions = store.completions.filter((completion) => completion.lessonId !== lessonId);
  writeStore(store);
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
