import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ARTICLE_SELECT, localizeArticle } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const { rows } = await pool.query(`${ARTICLE_SELECT} WHERE a.slug = $1`, [slug]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }
    const article = localizeArticle(rows[0], lang);
    await pool.query('UPDATE articles SET views = views + 1 WHERE id = $1', [article.id]);
    article.views = Number(article.views || 0) + 1;
    return NextResponse.json(article);
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
