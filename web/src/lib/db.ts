import 'server-only';
import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { _kabarPool?: Pool };

export const pool =
  globalForPg._kabarPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://kabar:kabar_secret@localhost:5432/kabar_nusantara',
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForPg._kabarPool = pool;

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
