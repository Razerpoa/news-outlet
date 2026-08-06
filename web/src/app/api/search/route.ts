import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { ARTICLE_FIELDS, flattenArticle, localizeArticle } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const q = (req.nextUrl.searchParams.get('q') ?? '').toString().trim();
    if (!q) return NextResponse.json({ items: [], total: 0 });

    // Wildcard PostgREST untuk ILIKE adalah `*` — bersihkan karakter yang
    // bisa mengubah makna pola (mis. `%`, `_`, koma pada sintaks .or()).
    const pattern = q.replace(/[*%_"(),]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!pattern) return NextResponse.json({ items: [], total: 0 });

    const supabase = getSupabase();
    const { data, error, count } = await supabase
      .from('articles')
      .select(ARTICLE_FIELDS, { count: 'exact' })
      .or(`title.ilike.*${pattern}*,excerpt.ilike.*${pattern}*,content.ilike.*${pattern}*`)
      .order('published_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    const items = (data ?? []).map((r) => localizeArticle(flattenArticle(r), lang));
    return NextResponse.json({ items, total: count ?? items.length, query: q });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
