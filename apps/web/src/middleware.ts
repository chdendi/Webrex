import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser } from '~/lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  // Skip auth when Supabase env vars aren't configured (e.g. CI build)
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    return next();
  }

  // /lessons/* is open to guests — progress APIs return { recorded: false }
  // for anonymous users (see src/pages/api/attempts.ts). Gating these routes
  // also breaks the "Continue without an account" link on /login, since the
  // default `next` points back into /lessons and produces a redirect loop.

  // If visiting /login but already logged in, redirect to next or home
  if (pathname === '/login') {
    const user = await getCurrentUser({ request, cookies });
    if (user) {
      const next = url.searchParams.get('next') ?? '/lessons/l1-1';
      return context.redirect(next, 302);
    }
  }

  return next();
});
