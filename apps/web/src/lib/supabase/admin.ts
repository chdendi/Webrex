import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client. Bypasses RLS — only use in server-side /api routes
 * AFTER you have validated the user via getCurrentUser().
 */
export const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
