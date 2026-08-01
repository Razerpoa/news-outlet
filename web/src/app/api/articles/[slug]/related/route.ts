import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ARTICLE_SELECT, localizeArticle, parseLimit } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const limit = parseLimit(req.nextUrl.searchParams.get('limit'), 4, 8);
    const { rows } = await pool.query(
      `${ARTICLE_SELECT}
       WHERE a.category_id = (SELECT category_id FROM articles WHERE slug = $1)
         AND a.slug <> $1
       ORDER BY a.published_at DESC
       LIMIT $2`,
      [slug, limit]
    );
    return NextResponse.json(rows.map((r) => localizeArticle(r, lang)));
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
