import { createBrowserClient } from '@supabase/ssr';

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Lazy singleton browser client. Used by login page and any client island
 * that needs to react to auth state.
 */
export function getSupabaseBrowserClient() {
  if (cached) return cached;
  cached = createBrowserClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
  return cached;
}
