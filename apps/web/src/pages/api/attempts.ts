import type { APIRoute } from 'astro';
import { supabaseAdmin } from '~/lib/supabase/admin';
import { getCurrentUser } from '~/lib/supabase/server';

export const prerender = false;

type AttemptBody = {
  eventId: string;
  lessonId: string;
  stepId: string;
  tier: 'hard' | 'soft' | 'self' | 'choice';
  confidence: 'high' | 'mid' | 'low' | null;
  passed: boolean;
  durationMs: number | null;
};

const TIERS = new Set(['hard', 'soft', 'self', 'choice']);
const CONFIDENCES = new Set(['high', 'mid', 'low']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(input: unknown): AttemptBody | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'body must be object' };
  const o = input as Record<string, unknown>;
  if (typeof o.eventId !== 'string' || !UUID_PATTERN.test(o.eventId)) {
    return { error: 'invalid eventId' };
  }
  if (typeof o.lessonId !== 'string' || o.lessonId.length === 0 || o.lessonId.length > 64) {
    return { error: 'invalid lessonId' };
  }
  if (typeof o.stepId !== 'string' || o.stepId.length === 0 || o.stepId.length > 64) {
    return { error: 'invalid stepId' };
  }
  if (typeof o.tier !== 'string' || !TIERS.has(o.tier)) {
    return { error: 'invalid tier' };
  }
  if (typeof o.passed !== 'boolean') {
    return { error: 'invalid passed' };
  }
  const confidence =
    o.confidence == null
      ? null
      : typeof o.confidence === 'string' && CONFIDENCES.has(o.confidence)
        ? (o.confidence as 'high' | 'mid' | 'low')
        : 'INVALID';
  if (confidence === 'INVALID') return { error: 'invalid confidence' };

  let durationMs: number | null = null;
  if (o.durationMs != null) {
    if (
      typeof o.durationMs !== 'number' ||
      !Number.isFinite(o.durationMs) ||
      o.durationMs < 0 ||
      o.durationMs > 60 * 60 * 1000
    ) {
      return { error: 'invalid durationMs' };
    }
    durationMs = Math.floor(o.durationMs);
  }

  return {
    eventId: o.eventId,
    lessonId: o.lessonId,
    stepId: o.stepId,
    tier: o.tier as AttemptBody['tier'],
    confidence,
    passed: o.passed,
    durationMs,
  };
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser({ request, cookies });

  // Anonymous users may attempt — we just don't persist. Return 200 so the
  // client UI flow stays uniform regardless of auth state.
  if (!user) {
    return Response.json({ recorded: false, reason: 'anonymous' });
  }

  const json = await request.json().catch(() => null);
  const parsed = parseBody(json);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('attempts').upsert(
    {
      user_id: user.id,
      client_event_id: parsed.eventId,
      lesson_id: parsed.lessonId,
      step_id: parsed.stepId,
      tier: parsed.tier,
      confidence: parsed.confidence,
      passed: parsed.passed,
      duration_ms: parsed.durationMs,
    },
    { onConflict: 'user_id,client_event_id', ignoreDuplicates: true },
  );

  if (error) {
    return Response.json({ error: 'insert_failed', detail: error.message }, { status: 500 });
  }

  return Response.json({ recorded: true });
};
