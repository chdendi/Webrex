/**
 * Deterministic mock data factory.
 *
 * Generalizes the social-stats pattern: provide a baseline of per-key
 * values, then apply FNV-1a hashed + UTC-day-seeded jitter so numbers
 * appear alive without thrashing on every reload.
 *
 * Usage:
 *   const factory = createMockFactory(baseline, { jitterAmplitude: 0.05 });
 *   const stats = factory.get(key);  // { value: number } or null
 */

/** FNV-1a 32-bit string hash → uniform float in [0, 1). */
function hashUnit(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x1_0000_0000;
}

function todaySeed(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function jitterFactor(unit: number, amplitude: number): number {
  return 1 + (unit * 2 - 1) * amplitude;
}

export interface MockFactoryOptions {
  /** How much to jitter each field (± this fraction). Default 0.05. */
  jitterAmplitude?: number;
}

/**
 * Creates a deterministic mock data fetcher.
 *
 * `baseline` is a Record<string, Record<string, number>> where the outer
 * key is the lookup key (e.g. lessonId) and the inner key is the field
 * name (e.g. 'completionsLast7d').
 *
 * Fields not in baseline are excluded from the result (sparse).
 */
export function createMockFactory<T extends Record<string, Record<string, number>>>(
  baseline: T,
  opts: MockFactoryOptions = {},
) {
  const jitterAmplitude = opts.jitterAmplitude ?? 0.05;

  return {
    get<K extends string & keyof T>(key: K, now: Date = new Date()): { [F in keyof T[K]]: number } | null {
      const base = baseline[key];
      if (!base) return null;

      const seed = `${String(key)}-${todaySeed(now)}`;
      const result = {} as { [F in keyof T[K]]: number };

      for (const field of Object.keys(base) as (keyof T[K])[]) {
        const unit = hashUnit(`${seed}-${String(field)}`);
        const factor = jitterFactor(unit, jitterAmplitude);
        result[field] = Math.max(1, Math.round(Number(base[field]) * factor));
      }

      return result;
    },

    /** Return baseline without jitter (for reference/display). */
    raw(key: string & keyof T): T[typeof key] | undefined {
      return baseline[key];
    },
  };
}
