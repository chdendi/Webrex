import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

interface Ctx {
  request: Request;
  cookies: AstroCookies;
}

/**
 * Anon-key server client bound to the current request's cookies.
 * Use for reads that should respect RLS as the logged-in user.
 */
export function createSupabaseServerClient({ request, cookies }: Ctx) {
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').filter(
          (c): c is { name: string; value: string } => typeof c.value === 'string',
        );
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          // Astro accepts the same option shape as @supabase/ssr.
          cookies.set(name, value, { path: '/', ...options });
        }
      },
    },
  });
}

/**
 * Returns the authenticated user (validated against the auth server) or null.
 * Always prefer this over getSession() in server code.
 *
 * Catches all errors (network failure, parse error, expired token, etc.) and
 * returns null so callers never have to wrap this in try/catch.
 */
export async function getCurrentUser(ctx: Ctx) {
  try {
    const supabase = createSupabaseServerClient(ctx);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch (err) {
    console.warn('[supabase] getCurrentUser failed:', err);
    return null;
  }
}

export { serializeCookieHeader };
