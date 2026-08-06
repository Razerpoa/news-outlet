import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { ARTICLE_FIELDS, flattenArticle, localizeArticle, parseLimit } from '@/lib/articles';
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
    const supabase = getSupabase();

    const { data: current } = await supabase
      .from('articles')
      .select('category_id')
      .eq('slug', slug)
      .maybeSingle();
    if (!current?.category_id) return NextResponse.json([]);

    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_FIELDS)
      .eq('category_id', current.category_id)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    const items = (data ?? []).map((r) => localizeArticle(flattenArticle(r), lang));
    return NextResponse.json(items);
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
