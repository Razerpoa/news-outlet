import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import {
  ARTICLE_FIELDS,
  flattenArticle,
  incrementArticleViews,
  localizeArticle,
} from '@/lib/articles';
import { langFrom } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lang = langFrom(req.nextUrl.searchParams.get('lang'));
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_FIELDS)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }
    const article = localizeArticle(flattenArticle(data), lang);
    await incrementArticleViews(article.id as number);
    article.views = Number(article.views || 0) + 1;
    return NextResponse.json(article);
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
