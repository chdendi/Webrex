import { supabaseAdmin } from '~/lib/supabase/admin';

/**
 * Returns the lesson ids the given user has passed at least one attempt for.
 *
 * Returns `[]` on any DB error so a transient Supabase outage degrades to
 * "no progress shown" instead of breaking the page.
 *
 * Callers are responsible for resolving the user (via `getCurrentUser`) so
 * a single page render only hits the auth endpoint once.
 */
export async function getCompletedLessonIdsForUser(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('attempts')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('passed', true);
    if (error) {
      console.warn('[progress] failed to load completed lessons:', error.message);
      return [];
    }
    const seen = new Set<string>();
    for (const row of data ?? []) {
      if (typeof row.lesson_id === 'string') seen.add(row.lesson_id);
    }
    return [...seen];
  } catch (err) {
    console.warn('[progress] failed to load completed lessons:', err);
    return [];
  }
}
