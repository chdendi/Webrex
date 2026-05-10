import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser } from '~/lib/supabase/server';

/**
 * Supabase auth cookies are named like `sb-<project-ref>-auth-token` (and
 * may be split into `.0`/`.1` chunks for large sessions). Older clients also
 * use `sb-access-token` / `sb-refresh-token`.
 */
const SUPABASE_AUTH_COOKIE = /^sb-.*-auth-token(\.\d+)?$|^sb-(access|refresh)-token$/;

function hasSupabaseAuthCookie(request: Request): boolean {
  const header = request.headers.get('Cookie');
  if (!header) return false;
  // Avoid pulling in a cookie parser — we only need the names.
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    const name = (eq === -1 ? part : part.slice(0, eq)).trim();
    if (SUPABASE_AUTH_COOKIE.test(name)) return true;
  }
  return false;
}

let envWarned = false;

export const onRequest = defineMiddleware(async (context, next) => {
  /**
   * Protection model:
   *   - Currently the only thing this middleware does is redirect already-authed
   *     visitors away from `/login`. There are no server-protected routes; APIs
   *     handle auth themselves (see `pages/api/attempts.ts`, which returns
   *     `{ recorded: false }` for anonymous users).
   *   - `/lessons/*` is intentionally open to guests — gating it would break the
   *     "Continue without an account" link on /login by producing a redirect loop.
   */
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  // Skip auth when Supabase env vars aren't configured (e.g. CI build, preview
  // without secrets). Warn once per isolate so the silent bypass is visible in
  // logs without spamming every request.
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    if (!envWarned) {
      console.warn('[middleware] Supabase env vars missing — auth bypassed');
      envWarned = true;
    }
    return next();
  }

  if (pathname === '/login') {
    // Short-circuit guests: skip the remote getUser() call when there's no
    // Supabase auth cookie at all. Without this, every guest hitting /login
    // pays a Supabase round-trip just to be told they're logged out.
    if (!hasSupabaseAuthCookie(request)) {
      return next();
    }
    const user = await getCurrentUser({ request, cookies });
    if (user) {
      const next = url.searchParams.get('next') ?? '/lessons/l1-1';
      return context.redirect(next, 302);
    }
  }

  return next();
});
