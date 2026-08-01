'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { t, type Lang } from '@/lib/lang';

export default function SearchBox({ initial, lang = 'id' }: { initial?: string; lang?: Lang }) {
  const router = useRouter();
  const [q, setQ] = useState(initial ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/cari?q=${encodeURIComponent(query)}`);
  };

  return (
    <form className="search-form" onSubmit={submit} role="search">
      <input
        type="search"
        placeholder={t(lang, 'search_placeholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={t(lang, 'search_aria')}
        autoFocus={!initial}
      />
      <button type="submit" className="btn">
        {t(lang, 'search_btn')}
      </button>
    </form>
  );
}
