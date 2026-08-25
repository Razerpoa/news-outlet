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
    terms_link: 'Syarat & Ketentuan',
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
    upload_file: 'Pilih File',
    upload_file_empty: 'Belum ada file terpilih',
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
    about_title: 'Tentang Kami',
    about_lead: withBrand(
      'KabarNusantara adalah portal berita independen yang hadir untuk masyarakat Indonesia dengan laporan yang akurat, berimbang, dan mendalam — dari Sabang sampai Merauke.',
    ),
    about_mission_title: 'Visi & Misi',
    about_mission_text: withBrand(
      'Visi kami menjadi rujukan utama berita nasional yang tepercaya. Misi kami memverifikasi fakta sebelum menerbitkan, menampilkan berbagai sudut pandang secara adil, serta menghadirkan konteks yang membantu pembaca memahami peristiwa — diperbarui setiap hari oleh redaksi KabarNusantara.',
    ),
    about_values_title: 'Nilai Redaksi',
    about_values_text:
      'Akurat: kami memverifikasi sebelum menerbitkan. Berimbang: setiap pihak mendapat ruang yang adil. Independen: tidak ada kepentingan yang mengarahkan pemberitaan. Mendalam: kami menghadirkan konteks, bukan sekadar kabar.',
    about_team_title: 'Tim Redaksi',
    about_team_lead: 'Struktur pimpinan redaksi saat ini:',
    about_role_editor_in_chief: 'Pemimpin Redaksi',
    about_role_managing_editor: 'Redaktur Pelaksana',
    about_contact_title: 'Hubungi Kami',
    about_contact_cta: withBrand(
      'Ada koreksi berita, pertanyaan pers, atau penawaran kerja sama? Tim redaksi KabarNusantara siap menerima pesan Anda.',
    ),
    terms_title: 'Syarat & Ketentuan',
    terms_lead: withBrand(
      'Dengan mengakses dan menggunakan situs KabarNusantara, Anda dianggap telah membaca, memahami, dan menyetujui ketentuan berikut.',
    ),
    terms_updated: 'Terakhir diperbarui',
    terms_s1_title: 'Penerimaan Ketentuan',
    terms_s1_body: withBrand(
      'Dengan masuk, menjelajah, atau berinteraksi dengan situs ini dalam bentuk apa pun, Anda menyatakan setuju untuk terikat oleh syarat dan ketentuan yang berlaku pada KabarNusantara. Apabila Anda tidak menyetujuinya, mohon hentikan penggunaan situs ini.',
    ),
    terms_s2_title: 'Kekayaan Intelektual',
    terms_s2_body: withBrand(
      'Seluruh konten pada KabarNusantara — termasuk teks, foto, grafis, logo, dan desain — dilindungi undang-undang hak cipta dan merupakan milik redaksi atau pemberi lisensinya. Dilarang menyalin, mendistribusikan ulang, atau memperjualbelikannya tanpa izin tertulis.',
    ),
    terms_s3_title: 'Penggunaan yang Diizinkan',
    terms_s3_body:
      'Anda boleh membaca, mencetak, dan membagikan tautan artikel untuk keperluan non-komersial dengan tetap mencantumkan atribusi dan tautan ke sumber aslinya. Kutipan singkat diperbolehkan sepanjang tidak mengubah makna isi berita.',
    terms_s4_title: 'Materi dari Pengguna',
    terms_s4_body: withBrand(
      'Apabila Anda mengirimkan materi — misalnya opini, foto, atau informasi liputan — kepada KabarNusantara, Anda menjamin bahwa materi tersebut asli dan tidak melanggar hak pihak lain, serta memberi redaksi izin untuk menyunting dan menerbitkannya dengan tetap mencantumkan identitas pengirim.',
    ),
    terms_s5_title: 'Tautan Pihak Ketiga',
    terms_s5_body:
      'Situs ini dapat memuat tautan menuju situs eksternal untuk melengkapi informasi. Kami tidak mengendalikan maupun bertanggung jawab atas isi, keakuratan, atau kebijakan privasi situs-situs tersebut.',
    terms_s6_title: 'Batasan Tanggung Jawab',
    terms_s6_body: withBrand(
      'KabarNusantara berupaya menyajikan informasi yang akurat dan tepat waktu, namun tidak menjamin situs bebas dari kesalahan atau gangguan. Kerugian langsung maupun tidak langsung yang timbul dari penggunaan situs ini tidak menjadi tanggung jawab redaksi sejauh diizinkan oleh hukum.',
    ),
    terms_s7_title: 'Perubahan Ketentuan',
    terms_s7_body: withBrand(
      'Redaksi KabarNusantara dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan di halaman ini, dan tanggal pembaruan di bagian atas akan disesuaikan.',
    ),
    terms_s8_title: 'Hukum yang Berlaku',
    terms_s8_body:
      'Syarat dan ketentuan ini tunduk pada hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan diselesaikan secara musyawarah, dan bila tidak tercapai, melalui pengadilan yang berwenang di Indonesia.',
    terms_closing: withBrand(
      'Pertanyaan tentang ketentuan ini dapat disampaikan melalui halaman Kontak redaksi KabarNusantara.',
    ),
    terms_closing_email:
      'Pertanyaan tentang ketentuan ini dapat disampaikan melalui email {email} atau halaman Kontak redaksi kami.',
    privacy_title: 'Kebijakan Privasi',
    privacy_lead: withBrand(
      'Privasi pembaca adalah prioritas redaksi KabarNusantara. Kebijakan ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak-hak yang Anda miliki.',
    ),
    privacy_updated: 'Terakhir diperbarui',
    privacy_s1_title: 'Informasi yang Kami Kumpulkan',
    privacy_s1_body: withBrand(
      'KabarNusantara hanya mengumpulkan data terbatas yang diperlukan untuk menyajikan layanan: data teknis seperti jenis peramban, perangkat, dan halaman yang dikunjungi, serta data yang Anda berikan secara sukarela — misalnya alamat email saat menghubungi redaksi.',
    ),
    privacy_s2_title: 'Penggunaan Informasi',
    privacy_s2_body: withBrand(
      'Informasi yang terkumpul digunakan untuk meningkatkan kualitas layanan, menganalisis tren pembacaan secara agregat, menjaga keamanan situs, serta membalas pesan yang Anda kirimkan kepada redaksi KabarNusantara.',
    ),
    privacy_s3_title: 'Cookie & Teknologi Serupa',
    privacy_s3_body:
      'Situs ini menggunakan cookie fungsional untuk menyimpan preferensi Anda — misalnya tema tampilan dan pilihan bahasa. Kami tidak memasang cookie iklan pihak ketiga maupun melacak aktivitas Anda di situs lain.',
    privacy_s4_title: 'Berbagi Informasi',
    privacy_s4_body: withBrand(
      'Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi pembaca kepada pihak ketiga. Pembagian data hanya dilakukan bila diwajibkan oleh hukum atau untuk melindungi hak dan keamanan KabarNusantara.',
    ),
    privacy_s5_title: 'Keamanan Data',
    privacy_s5_body:
      'Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi data dari akses, pengubahan, atau pengungkapan yang tidak sah. Namun, tidak ada metode transmisi melalui internet yang sepenuhnya aman.',
    privacy_s6_title: 'Penyimpanan Data',
    privacy_s6_body:
      'Data disimpan hanya selama diperlukan untuk tujuan yang dijelaskan dalam kebijakan ini atau selama diwajibkan oleh ketentuan hukum yang berlaku, setelah itu data dihapus atau dianonimkan.',
    privacy_s7_title: 'Hak Anda',
    privacy_s7_body: withBrand(
      'Anda berhak meminta akses, koreksi, atau penghapusan data pribadi yang kami simpan. Permintaan dapat disampaikan melalui kanal kontak resmi KabarNusantara dan akan kami proses dalam waktu yang wajar.',
    ),
    privacy_s8_title: 'Perubahan Kebijakan',
    privacy_s8_body: withBrand(
      'Redaksi KabarNusantara dapat memperbarui kebijakan privasi ini sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan di halaman ini, dan tanggal pembaruan di bagian atas akan disesuaikan.',
    ),
    privacy_closing: withBrand(
      'Pertanyaan tentang kebijakan privasi ini dapat disampaikan melalui halaman Kontak redaksi KabarNusantara.',
    ),
    privacy_closing_email:
      'Pertanyaan tentang kebijakan privasi ini dapat disampaikan melalui email {email} atau halaman Kontak redaksi kami.',
    contact_title: 'Kontak',
    contact_lead: withBrand(
      'Sampaikan pertanyaan, koreksi, iklan, atau kerja sama Anda kepada tim KabarNusantara melalui kanal resmi berikut.',
    ),
    contact_email_general_label: 'Email Umum',
    contact_email_editorial_label: 'Email Redaksi',
    contact_email_ads_label: 'Email Iklan & Kerja Sama',
    contact_phone_label: 'Telepon / WhatsApp',
    contact_address_label: 'Alamat Redaksi',
    contact_none_configured:
      'Kanal kontak belum dipublikasikan. Silakan periksa kembali halaman ini beberapa saat lagi.',
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
    terms_link: 'Terms & Conditions',
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
    upload_file: 'Choose File',
    upload_file_empty: 'No file chosen',
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
    about_title: 'About Us',
    about_lead: withBrand(
      'KabarNusantara is an independent news portal serving Indonesians with accurate, balanced, and in-depth reporting — from Sabang to Merauke.',
    ),
    about_mission_title: 'Vision & Mission',
    about_mission_text: withBrand(
      'Our vision is to be the most trusted reference for national news. Our mission is to verify facts before publishing, present every side fairly, and provide the context readers need to understand events — updated daily by the KabarNusantara editorial team.',
    ),
    about_values_title: 'Our Values',
    about_values_text:
      'Accurate: we verify before we publish. Balanced: every party gets a fair share of voice. Independent: no interest steers our coverage. In-depth: we deliver context, not just headlines.',
    about_team_title: 'Editorial Team',
    about_team_lead: 'Current editorial leadership:',
    about_role_editor_in_chief: 'Editor-in-Chief',
    about_role_managing_editor: 'Managing Editor',
    about_contact_title: 'Get in Touch',
    about_contact_cta: withBrand(
      'Corrections, press inquiries, or partnership proposals? The KabarNusantara editorial team welcomes your message.',
    ),
    terms_title: 'Terms & Conditions',
    terms_lead: withBrand(
      'By accessing and using the KabarNusantara website, you are deemed to have read, understood, and agreed to the following terms.',
    ),
    terms_updated: 'Last updated',
    terms_s1_title: 'Acceptance of Terms',
    terms_s1_body: withBrand(
      'By entering, browsing, or interacting with this site in any way, you agree to be bound by the terms and conditions applicable to KabarNusantara. If you do not agree, please stop using this site.',
    ),
    terms_s2_title: 'Intellectual Property',
    terms_s2_body: withBrand(
      'All content on KabarNusantara — including text, photos, graphics, logos, and design — is protected by copyright law and belongs to the editorial team or its licensors. Copying, redistributing, or commercializing it without written permission is prohibited.',
    ),
    terms_s3_title: 'Permitted Use',
    terms_s3_body:
      'You may read, print, and share article links for non-commercial purposes provided you include attribution and a link to the original source. Short quotations are allowed as long as they do not alter the meaning of the report.',
    terms_s4_title: 'User Submissions',
    terms_s4_body: withBrand(
      'When you submit material — such as opinions, photos, or report tips — to KabarNusantara, you warrant that it is original and does not infringe the rights of others, and you grant the editorial team permission to edit and publish it while crediting you.',
    ),
    terms_s5_title: 'Third-Party Links',
    terms_s5_body:
      'This site may contain links to external websites to complement its information. We neither control nor take responsibility for the content, accuracy, or privacy practices of those websites.',
    terms_s6_title: 'Limitation of Liability',
    terms_s6_body: withBrand(
      'KabarNusantara strives to provide accurate and timely information, but does not guarantee the site will be free of errors or interruptions. Direct or indirect losses arising from the use of this site are not the responsibility of the editorial team to the extent permitted by law.',
    ),
    terms_s7_title: 'Changes to These Terms',
    terms_s7_body: withBrand(
      'The KabarNusantara editorial team may update these terms and conditions from time to time. The latest version takes effect once published on this page, and the update date at the top will be adjusted accordingly.',
    ),
    terms_s8_title: 'Governing Law',
    terms_s8_body:
      'These terms and conditions are governed by the laws of the Republic of Indonesia. Disputes are settled amicably first and, failing that, through the competent courts in Indonesia.',
    terms_closing: withBrand(
      'Questions about these terms can be submitted through the KabarNusantara editorial Contact page.',
    ),
    terms_closing_email:
      'Questions about these terms can be sent to {email} or through our editorial Contact page.',
    privacy_title: 'Privacy Policy',
    privacy_lead: withBrand(
      'Reader privacy is a priority for the KabarNusantara editorial team. This policy explains what data we collect, how we use it, and the rights you have.',
    ),
    privacy_updated: 'Last updated',
    privacy_s1_title: 'Information We Collect',
    privacy_s1_body: withBrand(
      'KabarNusantara only collects limited data required to deliver its services: technical data such as browser, device, and pages visited, as well as data you provide voluntarily — for example your email address when contacting the editorial team.',
    ),
    privacy_s2_title: 'How We Use Information',
    privacy_s2_body: withBrand(
      'Collected information is used to improve service quality, analyze reading trends in aggregate, keep the site secure, and reply to messages you send to the KabarNusantara editorial team.',
    ),
    privacy_s3_title: 'Cookies & Similar Technologies',
    privacy_s3_body:
      'This site uses functional cookies to store your preferences — such as display theme and language choice. We do not install third-party advertising cookies or track your activity on other websites.',
    privacy_s4_title: 'Information Sharing',
    privacy_s4_body: withBrand(
      'We do not sell, rent, or trade readers’ personal data to third parties. Data is shared only when required by law or to protect the rights and security of KabarNusantara.',
    ),
    privacy_s5_title: 'Data Security',
    privacy_s5_body:
      'We apply reasonable technical and organizational measures to protect data from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is completely secure.',
    privacy_s6_title: 'Data Retention',
    privacy_s6_body:
      'Data is kept only as long as necessary for the purposes described in this policy or as required by applicable law, after which it is deleted or anonymized.',
    privacy_s7_title: 'Your Rights',
    privacy_s7_body: withBrand(
      'You have the right to request access to, correction of, or deletion of the personal data we hold. Requests can be submitted through official KabarNusantara contact channels and will be processed within a reasonable time.',
    ),
    privacy_s8_title: 'Changes to This Policy',
    privacy_s8_body: withBrand(
      'The KabarNusantara editorial team may update this privacy policy from time to time. The latest version takes effect once published on this page, and the update date at the top will be adjusted accordingly.',
    ),
    privacy_closing: withBrand(
      'Questions about this privacy policy can be submitted through the KabarNusantara editorial Contact page.',
    ),
    privacy_closing_email:
      'Questions about this privacy policy can be sent to {email} or through our editorial Contact page.',
    contact_title: 'Contact',
    contact_lead: withBrand(
      'Send your questions, corrections, advertising, or partnership requests to the KabarNusantara team through the official channels below.',
    ),
    contact_email_general_label: 'General Email',
    contact_email_editorial_label: 'Editorial Email',
    contact_email_ads_label: 'Advertising & Partnership Email',
    contact_phone_label: 'Phone / WhatsApp',
    contact_address_label: 'Editorial Address',
    contact_none_configured:
      'Contact channels have not been published yet. Please check this page again later.',
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
