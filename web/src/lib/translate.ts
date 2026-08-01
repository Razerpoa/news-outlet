import 'server-only';

/**
 * Terjemahan Indonesia → Inggris di sisi server (backend).
 *
 * Memakai MyMemory Translation API (https://mymemory.translated.net) yang gratis
 * tanpa kunci API. Batas per request ±500 karakter, jadi teks panjang dipecah
 * per paragraf menjadi potongan kecil.
 *
 * Catatan produksi: kuota gratis MyMemory terbatas. Untuk beban tinggi, ganti
 * dengan penyedia terjemahan berbayar (mis. Google Translate / DeepL) pada
 * fungsi translateChunk di bawah.
 *
 * Jika terjemahan gagal (kuota habis / jaringan / dll.), fungsi mengembalikan
 * null dan pemanggil boleh memutuskan: jatuh ke teks asli (bukan menggagalkan
 * publikasi artikel).
 */

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const MAX_CHUNK = 450; // aman di bawah batas 500 karakter MyMemory
const TIMEOUT_MS = 10_000;

/** Hapus entitas HTML yang kadang ikut dalam hasil MyMemory (&quot;, &#39;, ...). */
function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0*39;/g, "'");
}

async function translateChunk(text: string): Promise<string | null> {
  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=id|en`;
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const out: unknown = data?.responseData?.translatedText;
    if (typeof out !== 'string') return null;
    const cleaned = decodeEntities(out).trim();
    // MyMemory memakai pesan "MYMEMORY WARNING" saat kuota harian habis.
    if (!cleaned || cleaned.startsWith('MYMEMORY')) return null;
    return cleaned;
  } catch (err) {
    console.error('[TRANSLATE]', err);
    return null;
  }
}

/** Jalankan maksimal `limit` promise sekaligus (concurrency kecil agar ramah rate limit). */
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<string | null>) {
  const results: Array<string | null> = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Terjemahkan teks id → en. Mengembalikan null bila seluruhnya gagal,
 * sehingga pemanggil bisa memakai teks asli.
 */
export async function translateIdToEn(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Pecah per paragraf, lalu gabung menjadi potongan ≤ MAX_CHUNK karakter.
  const paragraphs = trimmed.split(/\n+/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length > MAX_CHUNK && current) {
      chunks.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  const results = await mapLimit(chunks, 3, translateChunk);
  if (results.some((r) => r === null)) return null;
  return (results as string[]).join('\n\n');
}

/** Terjemahkan judul, ringkasan, dan isi sekaligus (paralel, gagal → null per kolom). */
export async function translateArticle(
  title: string,
  excerpt: string,
  content: string
): Promise<{ titleEn: string | null; excerptEn: string | null; contentEn: string | null }> {
  const [titleEn, excerptEn, contentEn] = await Promise.all([
    translateIdToEn(title),
    translateIdToEn(excerpt),
    translateIdToEn(content),
  ]);
  return { titleEn, excerptEn, contentEn };
}
