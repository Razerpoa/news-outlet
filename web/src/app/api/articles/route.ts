import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ARTICLE_FIELDS, flattenArticle, localizeArticle, parseLimit, slugify } from '@/lib/articles';
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
  const supabase = getSupabase();
  const candidate = base || 'artikel';
  let slug = candidate;
  for (let i = 2; i <= 100; i++) {
    const { data } = await supabase.from('articles').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
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

    const supabase = getSupabase();
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .maybeSingle();
    if (!cat) {
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

    const { data: inserted, error } = await supabase
      .from('articles')
      .insert({
        slug,
        title,
        title_en: titleEn,
        excerpt,
        excerpt_en: excerptEn,
        content,
        content_en: contentEn,
        category_id: categoryId,
        author,
        image_url: image,
        published_at: new Date().toISOString(),
        views: 0,
        featured: false,
      })
      .select('id, slug')
      .single();
    if (error) throw error;

    return NextResponse.json(
      { id: inserted.id, slug: inserted.slug, translated: titleEn !== null },
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

    const supabase = getSupabase();
    let builder = supabase
      .from('articles')
      .select(ARTICLE_FIELDS, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (category) {
      builder = builder.eq('categories.slug', category);
    }
    const { data, error, count } = await builder;
    if (error) throw error;
    const items = (data ?? []).map((r) => localizeArticle(flattenArticle(r), lang));

    return NextResponse.json({
      items,
      total: count ?? (data?.length ?? 0),
      limit,
      offset,
    });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
