import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ARTICLE_SELECT, localizeArticle, parseLimit } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const limit = parseLimit(req.nextUrl.searchParams.get('limit'), 5, 8);
    const { rows } = await pool.query(
      `${ARTICLE_SELECT} ORDER BY a.views DESC, a.published_at DESC LIMIT $1`,
      [limit]
    );
    return NextResponse.json(rows.map((r) => localizeArticle(r, lang)));
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
