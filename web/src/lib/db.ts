import 'server-only';
import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { _kabarPool?: Pool };

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://kabar:kabar_secret@localhost:5432/kabar_nusantara';

// Supabase (host *.supabase.co / *.supabase.com) mewajibkan koneksi SSL.
// Bila DSN sudah memuat parameter sslmode, biarkan pg menanganinya sendiri.
const ssl = /sslmode=/.test(connectionString)
  ? undefined
  : /supabase\.(co|com)/.test(connectionString)
    ? { rejectUnauthorized: false }
    : undefined;

// Paksa IPv4: beberapa host Supabase hanya menerbitkan record AAAA (IPv6)
// dan jaringan ini tidak dapat menjangkau IPv6 (ENETUNREACH), sama seperti
// quirk OAuth Google — lihat lib/oauth.ts (family: 4).
// node-postgres meneruskan `family` ke net.connect, tetapi @types/pg belum
// mendeklarasikannya — karenanya di-cast.
const poolConfig = {
  connectionString,
  ssl,
  family: 4,
  max: 10,
} as import('pg').PoolConfig;

export const pool = globalForPg._kabarPool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') globalForPg._kabarPool = pool;

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
