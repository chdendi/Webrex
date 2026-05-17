/**
 * Social proof baseline numbers for lesson pages.
 *
 * These are intentional, modest mocks intended to give early learners a
 * sense that other people have walked the same path. They are NOT real
 * telemetry — replace this module with a query against the progress
 * tables once we have meaningful traffic.
 *
 * Numbers are taper-shaped: earlier lessons (L1.x) get the highest
 * completion counts and later lessons (L13.x) the lowest, matching the
 * realistic funnel of any course.
 */

export interface SocialStats {
  /** Completions in the past 7 days. */
  completionsLast7d: number;
  /** Total attempts (started, may not have completed). */
  totalAttempts: number;
  /** Average time-to-complete in minutes. */
  avgMinutes: number;
}

export const SOCIAL_STATS_BASELINE: Record<string, SocialStats> = {
  // L1 — basics (highest engagement)
  'l1-1': { completionsLast7d: 384, totalAttempts: 962, avgMinutes: 8.4 },
  'l1-3': { completionsLast7d: 298, totalAttempts: 762, avgMinutes: 10.2 },
  'l1-4': { completionsLast7d: 273, totalAttempts: 671, avgMinutes: 5.6 },

  // L2
  'l2-1': { completionsLast7d: 256, totalAttempts: 612, avgMinutes: 5.2 },
  'l2-2': { completionsLast7d: 232, totalAttempts: 561, avgMinutes: 6.8 },
  'l2-3': { completionsLast7d: 218, totalAttempts: 529, avgMinutes: 5.4 },
  'l2-4': { completionsLast7d: 201, totalAttempts: 487, avgMinutes: 6.6 },

  // L3
  'l3-1': { completionsLast7d: 188, totalAttempts: 451, avgMinutes: 6.7 },
  'l3-2': { completionsLast7d: 176, totalAttempts: 422, avgMinutes: 6.4 },
  'l3-3': { completionsLast7d: 164, totalAttempts: 389, avgMinutes: 5.1 },
  'l3-4': { completionsLast7d: 151, totalAttempts: 362, avgMinutes: 5.3 },

  // L4
  'l4-1': { completionsLast7d: 169, totalAttempts: 412, avgMinutes: 8.6 },
  'l4-2': { completionsLast7d: 157, totalAttempts: 379, avgMinutes: 8.2 },
  'l4-3': { completionsLast7d: 148, totalAttempts: 358, avgMinutes: 8.4 },
  'l4-4': { completionsLast7d: 138, totalAttempts: 331, avgMinutes: 8.7 },
  'l4-5': { completionsLast7d: 341, totalAttempts: 854, avgMinutes: 8.1 },

  // L5
  'l5-1': { completionsLast7d: 152, totalAttempts: 364, avgMinutes: 7.0 },
  'l5-2': { completionsLast7d: 142, totalAttempts: 339, avgMinutes: 6.8 },
  'l5-3': { completionsLast7d: 134, totalAttempts: 318, avgMinutes: 6.9 },
  'l5-4': { completionsLast7d: 125, totalAttempts: 296, avgMinutes: 6.6 },

  // L6
  'l6-1': { completionsLast7d: 124, totalAttempts: 296, avgMinutes: 6.9 },
  'l6-2': { completionsLast7d: 116, totalAttempts: 274, avgMinutes: 6.7 },
  'l6-3': { completionsLast7d: 108, totalAttempts: 258, avgMinutes: 6.8 },
  'l6-4': { completionsLast7d: 101, totalAttempts: 239, avgMinutes: 6.5 },

  // L7
  'l7-1': { completionsLast7d: 112, totalAttempts: 268, avgMinutes: 8.3 },
  'l7-2': { completionsLast7d: 104, totalAttempts: 247, avgMinutes: 8.1 },
  'l7-3': { completionsLast7d: 96, totalAttempts: 228, avgMinutes: 8.5 },
  'l7-4': { completionsLast7d: 89, totalAttempts: 211, avgMinutes: 6.8 },

  // L8
  'l8-1': { completionsLast7d: 96, totalAttempts: 226, avgMinutes: 6.6 },
  'l8-2': { completionsLast7d: 89, totalAttempts: 209, avgMinutes: 6.8 },
  'l8-3': { completionsLast7d: 83, totalAttempts: 195, avgMinutes: 8.4 },
  'l8-5': { completionsLast7d: 71, totalAttempts: 168, avgMinutes: 8.2 },

  // L9
  'l9-1': { completionsLast7d: 84, totalAttempts: 198, avgMinutes: 6.7 },
  'l9-2': { completionsLast7d: 78, totalAttempts: 184, avgMinutes: 8.4 },
  'l9-3': { completionsLast7d: 72, totalAttempts: 170, avgMinutes: 8.6 },

  // L10
  'l10-1': { completionsLast7d: 75, totalAttempts: 178, avgMinutes: 8.3 },
  'l10-2': { completionsLast7d: 70, totalAttempts: 165, avgMinutes: 8.5 },
  'l10-3': { completionsLast7d: 65, totalAttempts: 153, avgMinutes: 6.7 },

  // L11
  'l11-1': { completionsLast7d: 65, totalAttempts: 154, avgMinutes: 8.2 },
  'l11-2': { completionsLast7d: 60, totalAttempts: 142, avgMinutes: 8.4 },
  'l11-3': { completionsLast7d: 56, totalAttempts: 132, avgMinutes: 8.0 },

  // L12
  'l12-1': { completionsLast7d: 56, totalAttempts: 132, avgMinutes: 8.3 },
  'l12-2': { completionsLast7d: 52, totalAttempts: 123, avgMinutes: 8.1 },
  'l12-4': { completionsLast7d: 45, totalAttempts: 106, avgMinutes: 6.7 },

  // L13 — advanced (lowest)
  'l13-1': { completionsLast7d: 48, totalAttempts: 113, avgMinutes: 8.4 },
  'l13-2': { completionsLast7d: 44, totalAttempts: 104, avgMinutes: 8.2 },
};

/**
 * FNV-1a 32-bit string hash, normalized into a uniform float in [0, 1).
 * Inline implementation — no dependency, no crypto needed (we just want
 * a stable shuffle, not security).
 */
function hashUnit(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // Math.imul keeps the multiply within 32-bit signed range
    h = Math.imul(h, 0x01000193);
  }
  // Force unsigned and divide by 2^32 to get a value in [0, 1)
  return (h >>> 0) / 0x1_0000_0000;
}

/** UTC-stable YYYYMMDD seed component. */
function todaySeed(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Map a unit-interval random into a symmetric jitter multiplier
 * (1 - amplitude, 1 + amplitude). e.g. amplitude=0.05 -> [0.95, 1.05].
 */
function jitterFactor(unit: number, amplitude: number): number {
  return 1 + (unit * 2 - 1) * amplitude;
}

/**
 * Look up baseline social stats for a lesson and apply small,
 * deterministic per-day jitter so the numbers feel alive without
 * thrashing on every reload.
 *
 * Returns `null` when the lesson has no baseline — callers should
 * hide the UI rather than render zeros.
 */
export function getSocialStats(lessonId: string, now: Date = new Date()): SocialStats | null {
  const base = SOCIAL_STATS_BASELINE[lessonId];
  if (!base) return null;

  const seed = `${lessonId}-${todaySeed(now)}`;
  // Three independent draws by salting the seed differently per field.
  const jCompletions = jitterFactor(hashUnit(`${seed}-completions`), 0.05);
  const jAttempts = jitterFactor(hashUnit(`${seed}-attempts`), 0.05);
  const jMinutes = jitterFactor(hashUnit(`${seed}-minutes`), 0.1);

  return {
    completionsLast7d: Math.max(1, Math.round(base.completionsLast7d * jCompletions)),
    totalAttempts: Math.max(1, Math.round(base.totalAttempts * jAttempts)),
    avgMinutes: Math.max(0.5, Math.round(base.avgMinutes * jMinutes * 10) / 10),
  };
}
