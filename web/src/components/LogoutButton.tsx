'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getClientLang, t } from '@/lib/lang';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const lang = getClientLang();

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // tetap arahkan ke beranda walau permintaan logout gagal
    }
    router.push('/');
    router.refresh();
  };

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={logout}
      disabled={busy}
      title={t(lang, 'logout')}
      aria-label={t(lang, 'logout_aria')}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
