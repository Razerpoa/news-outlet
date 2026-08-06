import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';

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
  await query('DELETE FROM sessions WHERE expires_at < now()');
  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [sha256Hex(token), userId, SESSION_TTL_MS / 1000]
  );
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

  const { rows } = await query(
    `SELECT u.id, u.email, u.name, u.avatar_url
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256Hex(token)]
  );
  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
    avatar_url: rows[0].avatar_url,
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
    await query('DELETE FROM sessions WHERE token_hash = $1', [sha256Hex(token)]);
  }
  store.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}

/* --------------------------- Login Google OAuth --------------------------- */

/** Cek apakah email terdaftar sebagai penulis yang diizinkan (tabel authors). */
export async function isAuthorizedWriter(email: string): Promise<boolean> {
  const { rows } = await query('SELECT 1 FROM authors WHERE email = $1', [email.toLowerCase()]);
  return rows.length > 0;
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

  const { rows } = await query(
    `INSERT INTO users (email, name, avatar_url) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
     RETURNING id, email, name, avatar_url`,
    [email.toLowerCase(), name, avatarUrl]
  );
  const row = rows[0];
  return { id: row.id, email: row.email, name: row.name, avatar_url: row.avatar_url };
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
