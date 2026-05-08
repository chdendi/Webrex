import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '~/lib/supabase/server';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, url, redirect }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (!code) {
    return redirect('/login?error=missing_code', 302);
  }

  const supabase = createSupabaseServerClient({ request, cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`, 302);
  }

  return redirect(next, 302);
};
