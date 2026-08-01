import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ARTICLE_SELECT, localizeArticle, parseLimit, slugify } from '@/lib/articles';
import { langFrom } from '@/lib/lang';
import { translateArticle } from '@/lib/translate';

export const dynamic = 'force-dynamic';

// Gambar bawaan bila penulis tidak mengisi URL gambar
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'upload';
}

function mimeToExtension(contentType: string | null): string {
  switch (contentType?.toLowerCase()) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    default:
      return '.jpg';
  }
}

async function persistLocalImage(fileBuffer: Buffer, sourceName: string, contentType?: string): Promise<string> {
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'articles');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(sourceName) || mimeToExtension(contentType || null);
  const safeName = sanitizeFilename(path.basename(sourceName, ext) || `upload-${Date.now()}`);
  const finalName = `${safeName}-${Date.now()}${ext}`;
  const targetPath = path.join(uploadDir, finalName);

  await fs.writeFile(targetPath, fileBuffer);
  return `/uploads/articles/${finalName}`;
}

async function storeUploadedFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tipe file gambar tidak didukung');
  }
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  return persistLocalImage(fileBuffer, file.name, file.type);
}

async function storeRemoteImage(remoteUrl: string): Promise<string> {
  const target = new URL(remoteUrl);
  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error('URL gambar tidak valid');
  }

  const response = await fetch(target, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error('Gagal mengunduh gambar');
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error('URL yang dipilih bukan gambar');
  }

  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const ext = path.extname(target.pathname) || mimeToExtension(contentType);
  return persistLocalImage(fileBuffer, `remote-${Date.now()}${ext}`, contentType);
}

/** Hasilkan slug unik dari judul; bila bentrok, tambahkan angka (-2, -3, ...). */
async function uniqueSlug(base: string): Promise<string> {
  const candidate = base || 'artikel';
  let slug = candidate;
  for (let i = 2; i <= 100; i++) {
    const { rows } = await pool.query('SELECT 1 FROM articles WHERE slug = $1', [slug]);
    if (rows.length === 0) return slug;
    slug = `${candidate}-${i}`;
  }
  return `${candidate}-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    // Publikasi hanya untuk anggota redaksi yang sudah masuk.
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan masuk terlebih dahulu' }, { status: 401 });
    }

    let formData: FormData | null = null;
    let body: Record<string, unknown> | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData();
    } else {
      body = await req.json().catch(() => null);
    }

    if (!formData && (!body || typeof body !== 'object')) {
      return NextResponse.json({ error: 'Data artikel tidak valid' }, { status: 400 });
    }

    const title = String((formData?.get('title') ?? body?.title ?? '')).trim();
    const excerpt = String((formData?.get('excerpt') ?? body?.excerpt ?? '')).trim();
    const content = String((formData?.get('content') ?? body?.content ?? '')).trim();
    const author = String((formData?.get('author') ?? body?.author ?? '')).trim();
    const imageUrl = String((formData?.get('image_url') ?? body?.image_url ?? '')).trim();
    const featured = String(formData?.get('featured') ?? body?.featured ?? 'false') === 'true';
    const categoryId = parseInt(String(formData?.get('category_id') ?? body?.category_id ?? ''), 10);
    const uploadedFile = formData?.get('image_file');

    // Validasi input
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json({ error: 'Judul wajib diisi (minimal 5 karakter)' }, { status: 400 });
    }
    if (excerpt.length < 10 || excerpt.length > 300) {
      return NextResponse.json(
        { error: 'Ringkasan wajib diisi (10–300 karakter)' },
        { status: 400 }
      );
    }
    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Isi berita wajib diisi (minimal 50 karakter)' },
        { status: 400 }
      );
    }
    if (!isNonEmptyString(author)) {
      return NextResponse.json({ error: 'Nama penulis wajib diisi' }, { status: 400 });
    }
    if (!Number.isInteger(categoryId)) {
      return NextResponse.json({ error: 'Pilih kategori artikel' }, { status: 400 });
    }

    const cat = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (cat.rows.length === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 400 });
    }

    let image = DEFAULT_IMAGE;
    if (uploadedFile instanceof File) {
      image = await storeUploadedFile(uploadedFile);
    } else if (imageUrl) {
      try {
        image = await storeRemoteImage(imageUrl);
      } catch {
        return NextResponse.json({ error: 'URL gambar tidak valid' }, { status: 400 });
      }
    }

    const slug = await uniqueSlug(slugify(title));

    // Terjemahkan artikel ke bahasa Inggris di backend (gagal → versi en dikosongkan,
    // artikel tetap terbit dalam bahasa asli).
    const { titleEn, excerptEn, contentEn } = await translateArticle(title, excerpt, content);

    const { rows } = await pool.query(
      `INSERT INTO articles (slug, title, title_en, excerpt, excerpt_en, content, content_en, category_id, author, image_url, published_at, views, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), 0, $11)
       RETURNING id, slug`,
      [
        slug,
        title,
        titleEn,
        excerpt,
        excerptEn,
        content,
        contentEn,
        categoryId,
        author,
        image,
        featured,
      ]
    );

    return NextResponse.json(
      { id: rows[0].id, slug: rows[0].slug, translated: titleEn !== null },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const lang = langFrom(sp.get('lang'));
    const limit = parseLimit(sp.get('limit'), 12, 30);
    const offset = Math.max(parseInt(sp.get('offset') ?? '0', 10) || 0, 0);
    const category = (sp.get('category') ?? '').toString();

    let where = '';
    const params: unknown[] = [limit, offset];
    if (category) {
      where = 'WHERE c.slug = $3';
      params.push(category);
    }

    const { rows } = await pool.query(
      `${ARTICLE_SELECT} ${where} ORDER BY a.published_at DESC LIMIT $1 OFFSET $2`,
      params
    );
    const items = rows.map((r) => localizeArticle(r, lang));

    const countRes = await pool.query(
      category
        ? `SELECT COUNT(*)::int AS total FROM articles a JOIN categories c ON a.category_id = c.id WHERE c.slug = $1`
        : `SELECT COUNT(*)::int AS total FROM articles`,
      category ? [category] : []
    );

    return NextResponse.json({ items, total: countRes.rows[0].total, limit, offset });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
