-- ============================================================================
-- Skema + migrasi KabarNusantara untuk Supabase (PostgreSQL).
-- Idempotent — aman dijalankan berulang kali.
--
-- Cara pakai:
--   1. Tempel seluruh isi file ini ke Supabase SQL editor lalu Run (sekali),
--      ATAU
--   2. Biarkan seed yang membuatnya otomatis: set DATABASE_URL (Transaction
--      pooler, port 6543) di .env lalu jalankan `npm run seed` / start
--      container web. Setelah skema ada, aplikasi hanya butuh
--      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id      SERIAL PRIMARY KEY,
  slug    TEXT UNIQUE NOT NULL,
  name    TEXT NOT NULL,
  name_en TEXT,
  color   TEXT NOT NULL DEFAULT '#c0392b'
);

CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  title_en     TEXT,
  excerpt      TEXT NOT NULL,
  excerpt_en   TEXT,
  content      TEXT NOT NULL,
  content_en   TEXT,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author       TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views        INTEGER NOT NULL DEFAULT 0,
  featured     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_category   ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published  ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_views      ON articles(views DESC);

-- Pengguna yang pernah masuk lewat Google OAuth (publikasi hanya untuk penulis terdaftar)
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  name       TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unik email dijamin index (dibuat ulang idempotent agar database lama yang
-- masih memakai skema password ikut tercakup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Daftar penulis yang diizinkan (authorized writers). Login Google hanya berhasil
-- bila email pengguna terdaftar di tabel ini.
CREATE TABLE IF NOT EXISTS authors (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sesi login: token acak disimpan sebagai SHA-256 hash (token asli hanya di cookie)
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Migrasi database lama (username/password → email Google): idempotent, aman
-- dijalankan berulang. Pengguna lama tanpa email dihapus (sesi ikut terhapus).
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
DELETE FROM users WHERE email IS NULL;
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Tambah views secara atomik — dipanggil lewat PostgREST RPC dari API artikel
-- (web/src/lib/articles.ts → supabase.rpc('increment_article_views', ...)).
CREATE OR REPLACE FUNCTION public.increment_article_views(row_id integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE articles SET views = views + 1 WHERE id = row_id;
$$;
