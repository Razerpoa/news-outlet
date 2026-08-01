/**
 * Bahasa & terjemahan UI (id/en).
 * Modul ini aman dipakai dari server maupun client (tanpa import next/headers).
 * Server yang perlu membaca cookie pakai `getLang()` dari './lang-server'.
 */
import { SITE_BRAND_NAME } from '@/lib/brand';
export type Lang = 'id' | 'en';

export const LANG_COOKIE = 'kn_lang';

export const LANGS: Lang[] = ['id', 'en'];

export function isLang(v: unknown): v is Lang {
  return v === 'id' || v === 'en';
}

/** Normalisasi nilai mentah (mis. query param) menjadi Lang; selain itu → 'id'. */
export function langFrom(v: string | null | undefined): Lang {
  return isLang(v) ? v : 'id';
}

type Dict = Record<string, string>;
type Messages = Record<Lang, Dict>;

const withBrand = (value: string): string => value.replace(/KabarNusantara/g, SITE_BRAND_NAME);

export const messages: Messages = {
  id: {
    tagline: 'Jujur, Jernih, Mencerahkan',
    home: 'Beranda',
    nav_latest: 'Terbaru',
    write_news: 'Tulis Berita',
    login: 'Masuk',
    login_redaksi: 'Masuk Redaksi',
    logout: 'Keluar',
    logout_aria: 'Keluar dari redaksi',
    search_news: 'Cari Berita',
    search_link_aria: 'Cari berita',
    menu: 'Menu',
    open_menu: 'Buka menu navigasi',
    close_menu: 'Tutup menu',
    nav_main: 'Navigasi utama',
    news_latest: 'Berita Terbaru',
    view_all: 'Lihat Semua',
    read_more: 'Selengkapnya',
    category_picks: 'Pilihan Kategori',
    empty_no_news: 'Belum ada berita',
    empty_reload: 'Silakan muat ulang halaman beberapa saat lagi.',
    popular: 'Terpopuler',
    categories: 'Kategori',
    about_footer:
      'Portal berita independen yang menyajikan informasi akurat, berimbang, dan mendalam untuk masyarakat Indonesia. Diperbarui setiap hari dari Sabang sampai Merauke.',
    company: 'Perusahaan',
    about_us: 'Tentang Kami',
    editorial: 'Redaksi',
    media_guidelines: 'Pedoman Media Siber',
    careers: 'Karier',
    advertise: 'Iklan',
    services: 'Layanan',
    contact: 'Kontak',
    privacy: 'Kebijakan Privasi',
    search_link: 'Pencarian',
    copyright: withBrand('© 2026 KabarNusantara. Hak cipta dilindungi undang-undang.'),
    read_count: '{n} dibaca',
    minutes_read: '{n} menit baca',
    illustration: 'Ilustrasi: {title} — Dokumen redaksi (gambar ilustratif).',
    related_news: 'Berita Terkait',
    share: 'Bagikan',
    share_twitter: 'Bagikan di X (Twitter)',
    share_facebook: 'Bagikan di Facebook',
    share_whatsapp: 'Bagikan di WhatsApp',
    share_copy: 'Salin tautan',
    share_copied: 'Tersalin',
    all_latest: 'Semua Berita Terbaru',
    category_news: 'Berita {name}',
    cat_desc_all: 'Kumpulan berita terbaru dari seluruh kategori, diperbarui setiap hari.',
    cat_desc: withBrand('Kumpulan berita seputar {name} yang disusun redaksi KabarNusantara.'),
    prev: '← Sebelumnya',
    next: 'Berikutnya →',
    page_nav: 'Navigasi halaman',
    try_again_later: 'Coba periksa kembali beberapa saat lagi.',
    search_title: 'Cari Berita',
    search_hint_results: 'Menampilkan {n} hasil untuk kata kunci “{q}”',
    search_hint_query: 'Pencarian untuk kata kunci “{q}”',
    search_no_results: 'Tidak ada hasil untuk “{q}”',
    search_no_results_desc:
      'Coba gunakan kata kunci lain yang lebih umum, atau telusuri kategori untuk menemukan berita yang Anda cari.',
    search_empty_title: 'Temukan berita yang Anda butuhkan',
    search_empty_desc:
      'Ketik kata kunci di atas — misalnya nama topik, wilayah, atau istilah — lalu tekan tombol Cari.',
    search_placeholder: 'Cari berita, topik, atau kata kunci...',
    search_aria: 'Kata kunci pencarian',
    search_btn: 'Cari',
    login_title: 'Masuk Redaksi',
    login_lead:
      withBrand('Halaman ini khusus untuk tim redaksi. Masuk untuk menerbitkan berita baru di KabarNusantara.'),
    login_google_btn: 'Masuk dengan Google',
    login_google_aria: 'Masuk dengan akun Google',
    login_google_desc:
      withBrand('Gunakan akun Google yang terdaftar sebagai penulis KabarNusantara. Email lain tidak dapat masuk.'),
    login_error_unauthorized:
      'Akun Google ini belum terdaftar sebagai penulis. Hubungi redaksi untuk menambahkannya.',
    login_error_invalid_state: 'Percobaan masuk tidak valid. Silakan coba lagi.',
    login_error_oauth_failed: 'Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.',
    login_error_missing_config:
      'Login Google belum dikonfigurasi. Tambahkan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di lingkungan.',
    write_title: 'Tulis Berita',
    write_lead:
      'Kirim artikel baru ke redaksi. Setelah diterbitkan, artikel langsung tampil di beranda dan kanal kategorinya.',
    field_title: 'Judul Berita',
    field_title_ph: 'Contoh: Pemerintah Luncurkan Program Beasiswa Baru',
    field_category: 'Kategori',
    select_category: '— Pilih kategori —',
    field_excerpt: 'Ringkasan',
    field_excerpt_ph: 'Satu hingga dua kalimat inti berita...',
    excerpt_hint: '{n}/300 karakter — tampil sebagai cuplikan di beranda.',
    field_content: 'Isi Berita',
    field_content_ph:
      'Tulis isi berita di sini. Pisahkan antarparagraf dengan baris kosong...\n\nParagraf pertama menjadi lead berita.',
    content_hint: 'Minimal 50 karakter. Gunakan baris kosong untuk paragraf baru.',
    field_author: 'Penulis',
    field_author_ph: 'Nama jurnalis atau kontributor',
    field_image: 'URL Gambar Utama',
    field_image_ph: 'https://contoh.com/gambar.jpg (opsional)',
    image_hint: 'Kosongkan untuk memakai gambar ilustrasi bawaan redaksi.',
    image_preview_alt: 'Pratinjau gambar utama',
    featured_label: 'Jadikan berita unggulan (tampil di hero beranda)',
    required_note: 'Kolom bertanda * wajib diisi.',
    publish: 'Terbitkan Artikel',
    publishing: 'Menerbitkan…',
    slug_hint: 'Slug:',
    success_title: 'Artikel berhasil diterbitkan 🎉',
    success_desc: withBrand('Berita “{title}” kini tampil di beranda KabarNusantara.'),
    view_article: 'Lihat Artikel',
    write_another: 'Tulis Berita Lain',
    err_generic: 'Terjadi kesalahan pada server',
    not_found_title: 'Halaman tidak ditemukan',
    not_found_desc:
      'Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia. Silakan kembali ke beranda untuk membaca berita terbaru.',
    back_home: '← Kembali ke Beranda',
    error_title: 'Ups!',
    error_subtitle: 'Terjadi kesalahan saat memuat halaman',
    error_msg_default: 'Kesalahan tak terduga. Silakan coba lagi.',
    retry: 'Coba Lagi',
    theme_light: 'Aktifkan mode terang',
    theme_dark: 'Aktifkan mode gelap',
    theme_light_short: 'Mode terang',
    theme_dark_short: 'Mode gelap',
    lang_to_en: 'Switch to English',
    lang_to_id: 'Ganti ke Bahasa Indonesia',
    lang_label: 'Bahasa / Language',
    time_just_now: 'baru saja',
    time_min_ago: '{n} menit lalu',
    time_hour_ago: '{n} jam lalu',
    time_yesterday: 'kemarin',
    time_day_ago: '{n} hari lalu',
    time_week_ago: '{n} minggu lalu',
    meta_desc: withBrand(
      'KabarNusantara — portal berita independen Indonesia. Informasi akurat, berimbang, dan mendalam dari Sabang sampai Merauke.',
    ),
    meta_keys: ['berita', 'Indonesia', 'nasional', 'politik', 'ekonomi', 'teknologi', 'olahraga'].join(', '),
    og_desc: 'Portal berita independen Indonesia. Informasi akurat, berimbang, dan mendalam.',
    not_found_meta: 'Artikel tidak ditemukan',
  },
  en: {
    tagline: 'Honest, Clear, Enlightening',
    home: 'Home',
    nav_latest: 'Latest',
    write_news: 'Write News',
    login: 'Sign in',
    login_redaksi: 'Editor Sign in',
    logout: 'Sign out',
    logout_aria: 'Sign out of the editorial team',
    search_news: 'Search News',
    search_link_aria: 'Search news',
    menu: 'Menu',
    open_menu: 'Open navigation menu',
    close_menu: 'Close menu',
    nav_main: 'Main navigation',
    news_latest: 'Latest News',
    view_all: 'View All',
    read_more: 'Read More',
    category_picks: 'Category Picks',
    empty_no_news: 'No news yet',
    empty_reload: 'Please reload the page in a few moments.',
    popular: 'Most Popular',
    categories: 'Categories',
    about_footer:
      'An independent news portal delivering accurate, balanced, and in-depth information for Indonesians. Updated every day from Sabang to Merauke.',
    company: 'Company',
    about_us: 'About Us',
    editorial: 'Editorial',
    media_guidelines: 'Media Guidelines',
    careers: 'Careers',
    advertise: 'Advertise',
    services: 'Services',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    search_link: 'Search',
    copyright: withBrand('© 2026 KabarNusantara. All rights reserved.'),
    read_count: '{n} reads',
    minutes_read: '{n} min read',
    illustration: 'Illustration: {title} — Editorial document (illustrative image).',
    related_news: 'Related News',
    share: 'Share',
    share_twitter: 'Share on X (Twitter)',
    share_facebook: 'Share on Facebook',
    share_whatsapp: 'Share on WhatsApp',
    share_copy: 'Copy link',
    share_copied: 'Copied',
    all_latest: 'All Latest News',
    category_news: '{name} News',
    cat_desc_all: 'The latest news from every category, updated daily.',
    cat_desc: withBrand('A collection of {name} news curated by the KabarNusantara editorial team.'),
    prev: '← Previous',
    next: 'Next →',
    page_nav: 'Pagination',
    try_again_later: 'Please check back in a few moments.',
    search_title: 'Search News',
    search_hint_results: 'Showing {n} results for “{q}”',
    search_hint_query: 'Searching for “{q}”',
    search_no_results: 'No results for “{q}”',
    search_no_results_desc:
      'Try a broader keyword, or browse the categories to find the news you are looking for.',
    search_empty_title: 'Find the news you need',
    search_empty_desc:
      'Type a keyword above — a topic, region, or term — then press the Search button.',
    search_placeholder: 'Search news, topics, or keywords...',
    search_aria: 'Search keyword',
    search_btn: 'Search',
    login_title: 'Editor Sign in',
    login_lead:
      withBrand('This page is for the editorial team only. Sign in to publish new news on KabarNusantara.'),
    login_google_btn: 'Sign in with Google',
    login_google_aria: 'Sign in with your Google account',
    login_google_desc:
      withBrand('Use a Google account registered as a KabarNusantara writer. Other emails cannot sign in.'),
    login_error_unauthorized:
      'This Google account is not registered as a writer. Contact the editorial team to add it.',
    login_error_invalid_state: 'Invalid sign-in attempt. Please try again.',
    login_error_oauth_failed: 'Something went wrong signing in with Google. Please try again.',
    login_error_missing_config:
      'Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment.',
    write_title: 'Write News',
    write_lead:
      'Submit a new article to the editorial team. Once published, the article appears on the homepage and its category channel.',
    field_title: 'Headline',
    field_title_ph: 'Example: Government Launches New Scholarship Program',
    field_category: 'Category',
    select_category: '— Select category —',
    field_excerpt: 'Summary',
    field_excerpt_ph: 'One or two sentences summarizing the news...',
    excerpt_hint: '{n}/300 characters — shown as a snippet on the homepage.',
    field_content: 'Article Body',
    field_content_ph:
      'Write the article here. Separate paragraphs with a blank line...\n\nThe first paragraph becomes the lead.',
    content_hint: 'Minimum 50 characters. Use a blank line for a new paragraph.',
    field_author: 'Author',
    field_author_ph: 'Journalist or contributor name',
    field_image: 'Cover Image URL',
    field_image_ph: 'https://example.com/image.jpg (optional)',
    image_hint: 'Leave empty to use the editorial default illustration.',
    image_preview_alt: 'Cover image preview',
    featured_label: 'Feature this news (show in the homepage hero)',
    required_note: 'Fields marked * are required.',
    publish: 'Publish Article',
    publishing: 'Publishing…',
    slug_hint: 'Slug:',
    success_title: 'Article published 🎉',
    success_desc: withBrand('“{title}” is now live on the KabarNusantara homepage.'),
    view_article: 'View Article',
    write_another: 'Write Another',
    err_generic: 'Something went wrong on the server',
    not_found_title: 'Page not found',
    not_found_desc:
      'Sorry, the page you are looking for may have moved or is no longer available. Go back to the homepage for the latest news.',
    back_home: '← Back to Home',
    error_title: 'Oops!',
    error_subtitle: 'Something went wrong while loading the page',
    error_msg_default: 'Unexpected error. Please try again.',
    retry: 'Try Again',
    theme_light: 'Enable light mode',
    theme_dark: 'Enable dark mode',
    theme_light_short: 'Light mode',
    theme_dark_short: 'Dark mode',
    lang_to_en: 'Switch to English',
    lang_to_id: 'Ganti ke Bahasa Indonesia',
    lang_label: 'Language',
    time_just_now: 'just now',
    time_min_ago: '{n} minutes ago',
    time_hour_ago: '{n} hours ago',
    time_yesterday: 'yesterday',
    time_day_ago: '{n} days ago',
    time_week_ago: '{n} weeks ago',
    meta_desc: withBrand(
      'KabarNusantara — Indonesia’s independent news portal. Accurate, balanced, and in-depth reporting from Sabang to Merauke.',
    ),
    meta_keys: 'news, Indonesia, national, politics, economy, technology, sports',
    og_desc: 'Indonesia’s independent news portal. Accurate, balanced, and in-depth reporting.',
    not_found_meta: 'Article not found',
  },
};

/** Ambil teks terjemahan: t(lang, 'key', { n: 5 }) → "5 dibaca". */
export function t(lang: Lang, key: string, vars: Record<string, string | number> = {}): string {
  const dict = messages[lang] ?? messages.id;
  let str = dict[key] ?? messages.id[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.split(`{${k}}`).join(String(v));
  }
  return str;
}

/** Set cookie bahasa dari sisi klien (bukan httpOnly). */
export function setLangCookie(lang: Lang): void {
  try {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* abaikan */
  }
}

/** Baca bahasa aktif dari cookie di sisi klien (untuk komponen 'use client'). */
export function getClientLang(): Lang {
  try {
    const m = document.cookie.match(/(?:^|;\s*)kn_lang=([^;]+)/);
    return isLang(m?.[1]) ? (m[1] as Lang) : 'id';
  } catch {
    return 'id';
  }
}
