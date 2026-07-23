import type { APIRoute } from 'astro';
import { supabaseAdmin } from '~/lib/supabase/admin';
import { getCurrentUser } from '~/lib/supabase/server';

export const prerender = false;

type LocalAttempt = {
  eventId: string;
  lessonId: string;
  stepId: string;
  tier: 'hard' | 'soft' | 'self' | 'choice';
  confidence: 'high' | 'mid' | 'low' | null;
  passed: boolean;
  durationMs: number | null;
  ts: number;
};

type LocalCompletion = {
  lessonId: string;
  ts: number;
};

type SyncBody = {
  attempts: LocalAttempt[];
  completions: LocalCompletion[];
};

const TIERS = new Set(['hard', 'soft', 'self', 'choice']);
const CONFIDENCES = new Set(['high', 'mid', 'low']);
const MAX_ATTEMPTS = 1000;
const MAX_COMPLETIONS = 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseAttempt(input: unknown): LocalAttempt | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  if (typeof o.eventId !== 'string' || !UUID_PATTERN.test(o.eventId)) return null;
  if (typeof o.lessonId !== 'string' || o.lessonId.length === 0 || o.lessonId.length > 64) return null;
  if (typeof o.stepId !== 'string' || o.stepId.length === 0 || o.stepId.length > 64) return null;
  if (typeof o.tier !== 'string' || !TIERS.has(o.tier)) return null;
  if (typeof o.passed !== 'boolean') return null;
  if (typeof o.ts !== 'number' || !Number.isFinite(o.ts) || o.ts <= 0) return null;

  let confidence: 'high' | 'mid' | 'low' | null = null;
  if (o.confidence != null) {
    if (typeof o.confidence !== 'string' || !CONFIDENCES.has(o.confidence)) return null;
    confidence = o.confidence as 'high' | 'mid' | 'low';
  }

  let durationMs: number | null = null;
  if (o.durationMs != null) {
    if (
      typeof o.durationMs !== 'number' ||
      !Number.isFinite(o.durationMs) ||
      o.durationMs < 0 ||
      o.durationMs > 60 * 60 * 1000
    ) {
      return null;
    }
    durationMs = Math.floor(o.durationMs);
  }

  return {
    eventId: o.eventId,
    lessonId: o.lessonId,
    stepId: o.stepId,
    tier: o.tier as LocalAttempt['tier'],
    confidence,
    passed: o.passed,
    durationMs,
    ts: o.ts,
  };
}

function parseCompletion(input: unknown): LocalCompletion | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  if (typeof o.lessonId !== 'string' || o.lessonId.length === 0 || o.lessonId.length > 64) return null;
  if (typeof o.ts !== 'number' || !Number.isFinite(o.ts) || o.ts <= 0) return null;
  return { lessonId: o.lessonId, ts: o.ts };
}

function parseBody(input: unknown): SyncBody | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'body must be object' };
  const o = input as Record<string, unknown>;
  if (!Array.isArray(o.attempts)) return { error: 'attempts must be array' };
  if (!Array.isArray(o.completions)) return { error: 'completions must be array' };
  if (o.attempts.length > MAX_ATTEMPTS) return { error: 'too many attempts' };
  if (o.completions.length > MAX_COMPLETIONS) return { error: 'too many completions' };

  const attempts: LocalAttempt[] = [];
  for (const raw of o.attempts) {
    const parsed = parseAttempt(raw);
    if (!parsed) return { error: 'invalid attempt entry' };
    attempts.push(parsed);
  }

  const completions: LocalCompletion[] = [];
  for (const raw of o.completions) {
    const parsed = parseCompletion(raw);
    if (!parsed) return { error: 'invalid completion entry' };
    completions.push(parsed);
  }

  return { attempts, completions };
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser({ request, cookies });
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = parseBody(json);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  let insertedAttempts = 0;
  if (parsed.attempts.length > 0) {
    // Sort chronologically so the maintain_completion trigger sees first
    // attempts before passing ones.
    const ordered = [...parsed.attempts].sort((a, b) => a.ts - b.ts);
    const rows = ordered.map((a) => ({
      user_id: user.id,
      client_event_id: a.eventId,
      lesson_id: a.lessonId,
      step_id: a.stepId,
      tier: a.tier,
      confidence: a.confidence,
      passed: a.passed,
      duration_ms: a.durationMs,
      // Preserve client timestamp so percentile/rank reflect actual order.
      created_at: new Date(a.ts).toISOString(),
    }));
    const { error, count } = await supabaseAdmin.from('attempts').upsert(rows, {
      onConflict: 'user_id,client_event_id',
      ignoreDuplicates: true,
      count: 'exact',
    });
    if (error) {
      return Response.json({ error: 'insert_failed', detail: error.message }, { status: 500 });
    }
    insertedAttempts = count ?? rows.length;
  }

  // completions are auto-derived by the on_attempt_insert DB trigger from the
  // attempts we just wrote. We surface the *count of distinct completed lessons
  // the client reported* so the response shape is meaningful, but we don't need
  // a separate insert.
  const insertedCompletions = new Set(parsed.completions.map((c) => c.lessonId)).size;

  return Response.json({ insertedAttempts, insertedCompletions });
};
