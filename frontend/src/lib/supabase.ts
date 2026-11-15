import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Browser Supabase client using the PUBLIC anon key. It is only used to listen to
 * realtime changes; the database's RLS policies allow nothing but reads with this key.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

if (!supabase) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing: live updates are disabled.');
}
