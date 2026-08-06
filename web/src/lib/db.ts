import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const globalForSupabase = globalThis as unknown as { _kabarSupabase?: SupabaseClient };

/**
 * Klien Supabase (service role) untuk akses database via PostgREST.
 *
 * Dibuat lazy (bukan di modul load) agar file ini aman di-import saat
 * `docker build` yang tidak memiliki env — error baru muncul ketika klien
 * benar-benar dipakai (mis. sitemap saat runtime, bukan saat build).
 *
 * CATATAN: SUPABASE_SERVICE_ROLE_KEY melewati Row Level Security — jangan
 * pernah membocorkannya ke client bundle.
 */
export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diatur di environment');
  }
  if (!globalForSupabase._kabarSupabase) {
    globalForSupabase._kabarSupabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalForSupabase._kabarSupabase;
}
