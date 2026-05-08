import type { APIRoute } from 'astro';
import { supabaseAdmin } from '~/lib/supabase/admin';
import { getCurrentUser } from '~/lib/supabase/server';

export const prerender = false;

export const GET: APIRoute = async ({ url, request, cookies }) => {
  const lessonId = url.searchParams.get('lesson');
  if (!lessonId) {
    return Response.json({ error: 'missing_lesson' }, { status: 400 });
  }

  const user = await getCurrentUser({ request, cookies });

  // For anonymous users, return crowd stats only — no personal rank.
  if (!user) {
    const [{ count: totalCompletions }, { data: attempters }] = await Promise.all([
      supabaseAdmin.from('completions').select('user_id', { count: 'exact', head: true }).eq('lesson_id', lessonId),
      supabaseAdmin.from('attempts').select('user_id').eq('lesson_id', lessonId),
    ]);
    const totalAttempters = new Set((attempters ?? []).map((r) => r.user_id)).size;
    return Response.json({
      authenticated: false,
      totalCompletions: totalCompletions ?? 0,
      totalAttempters,
    });
  }

  const { data, error } = await supabaseAdmin.rpc('lesson_achievement', {
    p_lesson_id: lessonId,
    p_user_id: user.id,
  });

  if (error) {
    return Response.json({ error: 'rpc_failed', detail: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  return Response.json({
    authenticated: true,
    beatPercent: row?.beat_percent ?? null,
    completionRank: row?.completion_rank ?? null,
    attemptRank: row?.attempt_rank ?? null,
    totalCompletions: row?.total_completions ?? 0,
    totalAttempters: row?.total_attempters ?? 0,
    attemptsToPass: row?.attempts_to_pass ?? null,
  });
};
