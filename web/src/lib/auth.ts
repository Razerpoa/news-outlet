import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabase } from '@/lib/db';

export const SESSION_COOKIE = 'kn_session';
export const OAUTH_STATE_COOKIE = 'kn_oauth_state';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Buat sesi baru di DB, kembalikan token asli (hanya token asli yang masuk cookie). */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const supabase = getSupabase();
  await supabase.from('sessions').delete().lt('expires_at', new Date().toISOString());
  const { error } = await supabase.from('sessions').insert({
    token_hash: sha256Hex(token),
    user_id: userId,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  if (error) throw error;
  return token;
}

/** Set cookie httpOnly untuk sesi (dipanggil dari route handler login). */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** Baca pengguna dari cookie sesi; null bila tidak login/sesi kedaluwarsa. */
export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabase = getSupabase();
  const { data } = await supabase
    .from('sessions')
    .select('users (id, email, name, avatar_url)')
    .eq('token_hash', sha256Hex(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  const user = data?.users as AuthUser | undefined;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
  };
}

/** Untuk halaman server: redirect ke /login bila belum login. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

/** Hapus sesi dari DB dan bersihkan cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const supabase = getSupabase();
    await supabase.from('sessions').delete().eq('token_hash', sha256Hex(token));
  }
  store.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}

/* --------------------------- Login Google OAuth --------------------------- */

/** Cek apakah email terdaftar sebagai penulis yang diizinkan (tabel authors). */
export async function isAuthorizedWriter(email: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('authors')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  return data !== null;
}

/**
 * Simpan/perbarui pengguna Google lalu kembalikan AuthUser.
 * Mengembalikan null bila email tidak terdaftar sebagai penulis yang diizinkan.
 */
export async function authorizeGoogleUser(
  email: string,
  name: string | null,
  avatarUrl: string | null
): Promise<AuthUser | null> {
  if (!(await isAuthorizedWriter(email))) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .upsert({ email: email.toLowerCase(), name, avatar_url: avatarUrl }, { onConflict: 'email' })
    .select('id, email, name, avatar_url')
    .single();
  if (error || !data) return null;
  return { id: data.id, email: data.email, name: data.name, avatar_url: data.avatar_url };
}

/** State acak untuk mencegah serangan CSRF pada alur OAuth. */
export function createOAuthState(): string {
  return randomBytes(24).toString('hex');
}

export async function setOAuthStateCookie(state: string): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600, // 10 menit
  });
}

/** Baca lalu hapus state OAuth dari cookie (sekali pakai). */
export async function consumeOAuthState(): Promise<string | null> {
  const store = await cookies();
  const state = store.get(OAUTH_STATE_COOKIE)?.value ?? null;
  if (state) store.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
  return state;
}
