import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ARTICLE_SELECT, localizeArticle } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const q = (req.nextUrl.searchParams.get('q') ?? '').toString().trim();
    if (!q) return NextResponse.json({ items: [], total: 0 });
    const { rows } = await pool.query(
      `${ARTICLE_SELECT}
       WHERE a.title ILIKE $1 OR a.excerpt ILIKE $1 OR a.content ILIKE $1
       ORDER BY a.published_at DESC
       LIMIT 30`,
      [`%${q}%`]
    );
    const items = rows.map((r) => localizeArticle(r, lang));
    return NextResponse.json({ items, total: rows.length, query: q });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
