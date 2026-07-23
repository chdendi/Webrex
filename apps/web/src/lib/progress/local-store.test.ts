import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  appendAttempt,
  appendCompletion,
  readAttempts,
  readCompletions,
  removeAttempts,
  removeCompletions,
} from './local-store';
import type { LocalAttempt } from './local-store';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const attempt = (eventId = crypto.randomUUID()): LocalAttempt => ({
  eventId,
  lessonId: 'l1-1',
  stepId: 'verify',
  tier: 'choice',
  confidence: 'high',
  passed: true,
  durationMs: 1200,
  ts: 1_700_000_000_000,
});

describe('progress local outbox', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('window', { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('removes only acknowledged attempts', () => {
    const first = attempt();
    const second = attempt();
    appendAttempt(first);
    appendAttempt(second);

    removeAttempts([first.eventId]);

    expect(readAttempts()).toEqual([second]);
  });

  it('keeps completions added after the acknowledged snapshot', () => {
    appendCompletion('l1-1');
    const snapshot = readCompletions();
    appendCompletion('l1-2');

    removeCompletions(snapshot);

    expect(readCompletions().map((completion) => completion.lessonId)).toEqual(['l1-2']);
  });

  it('adds an event id to queued attempts from the v1 store', () => {
    const legacy = attempt() as Partial<LocalAttempt>;
    delete legacy.eventId;
    storage.setItem('webrex:progress:v1', JSON.stringify({ attempts: [legacy], completions: [] }));

    const [migrated] = readAttempts();

    expect(migrated.eventId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(readAttempts()[0].eventId).toBe(migrated.eventId);
  });
});
