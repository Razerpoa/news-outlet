import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { localizeCategory } from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const supabase = getSupabase();
    // Jumlah artikel per kategori via aggregate PostgREST (articles(count)).
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name, name_en, color, articles(count)')
      .order('name', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []).map((r: Record<string, unknown>) => {
      const articles = r.articles as Array<{ count?: number }> | null | undefined;
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        name_en: r.name_en,
        color: r.color,
        article_count: articles?.[0]?.count ?? 0,
      };
    });
    return NextResponse.json(rows.map((r) => localizeCategory(r, lang)));
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
