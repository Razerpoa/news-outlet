import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { localizeCategory } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const { rows } = await pool.query(`
      SELECT c.id, c.slug, c.name, c.name_en, c.color, COUNT(a.id)::int AS article_count
      FROM categories c
      LEFT JOIN articles a ON a.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return NextResponse.json(rows.map((r) => localizeCategory(r, lang)));
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
