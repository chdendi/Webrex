import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '~/lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  // Skip auth when Supabase env vars aren't configured (e.g. CI build)
  if (!import.meta.env.PUBLIC_SUPABASE_URL) {
    return next();
  }

  // Protect /lessons/* routes
  if (pathname.startsWith('/lessons')) {
    const supabase = createSupabaseServerClient({ request, cookies });
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const target = '/login?next=' + encodeURIComponent(pathname + url.search);
      return context.redirect(target, 302);
    }
  }

  // If visiting /login but already logged in, redirect to next or home
  if (pathname === '/login') {
    const supabase = createSupabaseServerClient({ request, cookies });
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const next = url.searchParams.get('next') ?? '/lessons/l1-1';
      return context.redirect(next, 302);
    }
  }

  return next();
});
