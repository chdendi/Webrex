import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser } from '~/lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  // Skip auth when Supabase env vars aren't configured (e.g. CI build)
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    return next();
  }

  // Protect /lessons/* routes
  if (pathname.startsWith('/lessons')) {
    const user = await getCurrentUser({ request, cookies });
    if (!user) {
      const target = '/login?next=' + encodeURIComponent(pathname + url.search);
      return context.redirect(target, 302);
    }
  }

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
