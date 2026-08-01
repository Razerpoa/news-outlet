import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import ArticleForm from '@/components/ArticleForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'write_title'),
    description: t(lang, 'write_lead'),
  };
}

export default async function WritePage() {
  // Hanya anggota redaksi yang boleh menerbitkan; lainnya dialihkan ke halaman masuk.
  await requireUser();

  const lang = await getLang();
  const categories = (await api.categories(lang)) ?? [];

  return <ArticleForm categories={categories} lang={lang} />;
}
