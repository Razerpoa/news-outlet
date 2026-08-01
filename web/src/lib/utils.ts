import { t, type Lang } from './lang';

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'id-ID');

/** Format tanggal panjang: "31 Juli 2026" / "July 31, 2026" */
export function formatDate(iso: string, lang: Lang = 'id'): string {
  return new Date(iso).toLocaleDateString(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format tanggal + waktu: "31 Juli 2026, 08.30 WIB" */
export function formatDateTime(iso: string, lang: Lang = 'id'): string {
  const date = new Date(iso).toLocaleDateString(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = new Date(iso).toLocaleTimeString(locale(lang), {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date}, ${time} WIB`;
}

/** Waktu relatif: "2 jam lalu" / "2 hours ago" */
export function timeAgo(iso: string, lang: Lang = 'id'): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t(lang, 'time_just_now');
  if (minutes < 60) return t(lang, 'time_min_ago', { n: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t(lang, 'time_hour_ago', { n: hours });

  const days = Math.floor(hours / 24);
  if (days === 1) return t(lang, 'time_yesterday');
  if (days < 7) return t(lang, 'time_day_ago', { n: days });
  if (days < 30) return t(lang, 'time_week_ago', { n: Math.floor(days / 7) });

  return formatDate(iso, lang);
}

/** Estimasi waktu baca (220 kata/menit, rata-rata kecepatan baca bahasa Indonesia) */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Angka dengan pemisah ribuan: 12.340 (id) / 12,340 (en) */
export function formatViews(n: number, lang: Lang = 'id'): string {
  return n.toLocaleString(locale(lang));
}

/** Hari ini: "Jumat, 31 Juli 2026" / "Friday, July 31, 2026" */
export function todayLong(lang: Lang = 'id'): string {
  return new Date().toLocaleDateString(locale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
