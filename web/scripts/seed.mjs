/**
 * Migrasi skema + seed data awal untuk KabarNusantara.
 * Idempotent: aman dijalankan berulang kali.
 * Menjalankan: npm run seed (atau node scripts/seed.mjs)
 *
 * Akses data memakai Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 * via PostgREST (REST API). Skema database dibuat otomatis bila DATABASE_URL
 * tersedia; bila tidak, tempel isi scripts/schema.sql ke SQL editor Supabase
 * sekali saja (skema idempotent, aman dijalankan ulang).
 *
 * Artikel di-seed dalam dua bahasa: kolom title_en/excerpt_en/content_en berisi
 * terjemahan Inggris yang dikurasi (bukan hasil API), sehingga mode EN langsung
 * tersedia tanpa jaringan. Artikel yang sudah ada hanya di-backfill kolom *_en
 * (kolom Indonesia + views/featured/published_at dipertahankan).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_SQL_PATH = path.join(__dirname, 'schema.sql');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

// Klien Supabase (service role) — dibuat lazy agar error yang jelas muncul
// saat env tidak lengkap, bukan saat import modul.
function getSupabase() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi (lihat .env.example)');
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ---------------------------------- Skema --------------------------------- */

// Definisi skema + migrasi dipindah ke scripts/schema.sql (sumber tunggal) —
// bisa dijalankan dari seed saat DATABASE_URL tersedia, atau ditempel ke SQL
// editor Supabase. Termasuk: tabel categories/articles/users/authors/sessions,
// index, migrasi lama (username/password → email Google), dan fungsi
// increment_article_views (dipakai API untuk menambah views secara atomik).

/* -------------------------------- Kategori --------------------------------- */

const CATEGORIES = [
  { slug: 'nasional',      name: 'Nasional',      name_en: 'National',      color: '#c0392b' },
  { slug: 'politik',       name: 'Politik',       name_en: 'Politics',      color: '#8e44ad' },
  { slug: 'ekonomi',       name: 'Ekonomi',       name_en: 'Economy',       color: '#1e8449' },
  { slug: 'teknologi',     name: 'Teknologi',     name_en: 'Technology',    color: '#2471a3' },
  { slug: 'olahraga',      name: 'Olahraga',      name_en: 'Sports',        color: '#e67e22' },
  { slug: 'hiburan',       name: 'Hiburan',       name_en: 'Entertainment', color: '#c2185b' },
  { slug: 'kesehatan',     name: 'Kesehatan',     name_en: 'Health',        color: '#148f77' },
  { slug: 'internasional', name: 'Internasional', name_en: 'International', color: '#34495e' },
  { slug: 'pendidikan',    name: 'Pendidikan',    name_en: 'Education',     color: '#b7950b' },
];

/* --------------------------------- Gambar ---------------------------------- */

const IMAGES = [
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
];

/* --------------------------- Artikel utama (tulis tangan) --------------------------- */

const AUTHORS = [
  'Andi Pratama', 'Sari Wulandari', 'Budi Santoso', 'Rina Marlina',
  'Hendra Wijaya', 'Fajar Ramadhan', 'Nadia Safitri', 'Rizky Ananda',
  'Yoga Pradana', 'Clara Manurung', 'Dimas Aryo', 'Laras Ayu',
  'Galih Saputra', 'Intan Permata', 'Raka Wiradana',
];

const FEATURED = [
  {
    slug: 'koridor-transportasi-terintegrasi-jabodetabek',
    title: 'Presiden Resmikan Koridor Transportasi Publik Terintegrasi di Jabodetabek',
    titleEn: 'President Inaugurates Integrated Public Transport Corridor in Greater Jakarta',
    excerpt: 'Proyek strategis nasional ini menghubungkan 14 stasiun kereta, 32 halte BRT, dan 8 simpul park and ride dalam satu sistem tiket terpadu.',
    excerptEn: 'The national strategic project links 14 train stations, 32 BRT stops, and 8 park-and-ride hubs under a single integrated ticketing system.',
    category: 'nasional',
    author: 'Andi Pratama',
    image: 8,
    featured: true,
    views: 28450,
    daysAgo: 0.2,
    content: [
      'Presiden meresmikan koridor transportasi publik terintegrasi di kawasan Jabodetabek, Jumat (31/7/2026). Proyek strategis nasional ini menghubungkan 14 stasiun kereta rel listrik, 32 halte bus rapid transit, dan 8 simpul park and ride dalam satu sistem tiket terpadu.',
      'Dalam sambutannya, Presiden menegaskan bahwa integrasi antarmoda merupakan kunci untuk mengurai kemacetan dan mendorong peralihan masyarakat dari kendaraan pribadi ke transportasi massal. "Kita ingin mobilitas yang cepat, aman, dan terjangkau bagi seluruh warga," ujarnya.',
      'Sistem tiket terpadu memungkinkan penumpang berpindah moda hanya dengan satu kartu, lengkap dengan aplikasi pembayaran digital yang dapat diakses dari gawai masing-masing. Tarif integrasi juga diberlakukan untuk perjalanan yang memakai lebih dari satu moda.',
      'Direktur utama operator lintas moda menyebut kapasitas angkut harian koridor ini mencapai 1,2 juta penumpang. Ia optimistis target perpindahan 25 persen pengguna kendaraan pribadi dapat tercapai dalam dua tahun pertama operasi.',
      'Pengamat perkotaan dari lembaga riset independen menilai langkah ini positif, tetapi mengingatkan bahwa penyediaan angkutan pengumpan di kawasan pinggiran serta keamanan pejalan kaki harus terus dibenahi agar integrasi benar-benar terasa.',
      'Fase berikutnya akan menghubungkan koridor dengan kawasan industri dan bandara internasional, dengan target penyelesaian bertahap hingga 2028.',
    ],
    contentEn: [
      'The President inaugurated the integrated public transport corridor in the Greater Jakarta area on Friday (July 31, 2026). The national strategic project connects 14 electric railway stations, 32 bus rapid transit stops, and 8 park-and-ride hubs under a single integrated ticketing system.',
      'In his remarks, the President stressed that intermodal integration is the key to easing congestion and encouraging people to shift from private cars to mass transit. "We want fast, safe, and affordable mobility for all citizens," he said.',
      'The integrated ticketing system lets passengers switch modes with a single card, complemented by a digital payment app accessible from their own devices. Integrated fares also apply to trips that use more than one mode.',
      'The chief executive of the cross-modal operator said the corridor can carry up to 1.2 million passengers a day. He is optimistic that the target of shifting 25 percent of private vehicle users can be met within the first two years of operation.',
      'An urban analyst from an independent research institute called the move positive, but warned that feeder services in suburban areas and pedestrian safety must keep improving for the integration to be truly felt.',
      'The next phase will connect the corridor to industrial estates and the international airport, with staged completion targeted through 2028.',
    ],
  },
  {
    slug: 'inflasi-terkendali-daya-beli-pulih',
    title: 'Inflasi Juni Terkendali di 2,8 Persen, Daya Beli Masyarakat Mulai Pulih',
    titleEn: 'June Inflation Held at 2.8 Percent as Consumer Purchasing Power Recovers',
    excerpt: 'Tekanan harga pangan mulai mereda seiring panen raya dan membaiknya distribusi logistik di berbagai daerah.',
    excerptEn: 'Food price pressure is easing as the main harvest arrives and logistics distribution improves across regions.',
    category: 'ekonomi',
    author: 'Sari Wulandari',
    image: 25,
    featured: true,
    views: 21320,
    daysAgo: 0.4,
    content: [
      'Badan Pusat Statistik mencatat inflasi Juni 2026 sebesar 2,8 persen secara tahunan, tetap berada dalam kisaran sasaran pemerintah. Tekanan harga pangan mulai mereda seiring panen raya dan membaiknya distribusi logistik.',
      'Kelompok makanan, minuman, dan tembakau menyumbang andil terbesar, diikuti kelompok transportasi yang dipengaruhi penyesuaian harga bahan bakar pada awal tahun.',
      'Kepala ekonom bank sentral menilai angka ini menunjukkan daya beli masyarakat yang mulai pulih, tercermin dari naiknya penjualan ritel dan konsumsi listrik rumah tangga pada kuartal kedua.',
      'Pemerintah menyatakan akan terus menjaga stabilitas harga melalui operasi pasar murah dan penguatan cadangan pangan pemerintah, terutama menjelang momen-momen puncak permintaan.',
      'Ke depan, risiko utama datang dari gejolak harga pangan global dan pergerakan nilai tukar. Para pengamat meminta otoritas tetap waspada namun tidak perlu buru-buru mengubah kebijakan moneter.',
    ],
    contentEn: [
      'The Central Bureau of Statistics recorded June 2026 inflation at 2.8 percent year-on-year, staying within the government\'s target range. Food price pressure has begun to ease with the main harvest and better logistics distribution.',
      'Food, beverages, and tobacco contributed the largest share, followed by transport, which was affected by fuel price adjustments earlier in the year.',
      'The central bank\'s chief economist said the figure shows purchasing power is beginning to recover, reflected in higher retail sales and household electricity consumption in the second quarter.',
      'The government said it will keep prices stable through cheap-market operations and stronger government food reserves, especially ahead of peak demand periods.',
      'Going forward, the main risks come from global food price volatility and exchange-rate movements. Analysts urged authorities to stay vigilant without rushing to change monetary policy.',
    ],
  },
  {
    slug: 'timnas-indonesia-semifinal-piala-asia',
    title: 'Timnas Indonesia Melaju ke Semifinal Piala Asia usai Menaklukkan Korea Selatan',
    titleEn: 'Indonesia Reach Asian Cup Semifinals After Beating South Korea',
    excerpt: 'Dua gol di babak pertama dan menit akhir memastikan kemenangan dramatis 2-1 dan tiket ke babak empat besar.',
    excerptEn: 'Two goals in the first half and in stoppage time secured a dramatic 2-1 win and a place in the last four.',
    category: 'olahraga',
    author: 'Budi Santoso',
    image: 19,
    featured: true,
    views: 35120,
    daysAgo: 0.6,
    content: [
      'Tim nasional Indonesia memastikan tempat di semifinal Piala Asia 2026 setelah menaklukkan Korea Selatan 2-1 dalam laga dramatis yang berlangsung Jumat malam WIB.',
      'Gol pembuka dicetak pada menit ke-23 melalui skema serangan balik cepat yang diakhiri sepakan keras dari sayap kanan. Korea Selatan sempat menyamakan kedudukan lewat tendangan bebas pada babak kedua.',
      'Di menit ke-88, pemain pengganti memastikan kemenangan lewat sundulan yang memanfaatkan sepak pojok, memicu selebrasi ribuan suporter di tribun dan layar-layar kota.',
      'Pelatih timnas memuji disiplin taktik para pemain dan dukungan suporter yang luar biasa. "Kami bermain sebagai satu kesatuan. Semifinal bukan tujuan akhir," katanya dalam konferensi pers usai laga.',
      'Di semifinal, Indonesia akan menghadapi pemenang laga antara Jepang dan Arab Saudi. Ini merupakan pencapaian terbaik timnas Indonesia di ajang ini sejak era 1950-an.',
    ],
    contentEn: [
      'The Indonesian national team secured a place in the 2026 Asian Cup semifinals after beating South Korea 2-1 in a dramatic match played Friday evening Western Indonesian Time.',
      'The opening goal came in the 23rd minute from a fast counterattack finished with a powerful strike from the right wing. South Korea briefly equalized through a free kick in the second half.',
      'In the 88th minute, a substitute sealed the win with a header from a corner kick, triggering celebrations from thousands of fans in the stands and on city screens.',
      'The national team coach praised the players\' tactical discipline and the fans\' outstanding support. "We played as one unit. The semifinal is not the final goal," he said in the post-match press conference.',
      'In the semifinal, Indonesia will face the winner of the match between Japan and Saudi Arabia. This is Indonesia\'s best result in the tournament since the 1950s.',
    ],
  },
  {
    slug: 'startup-logistik-pendanaan-seri-b',
    title: 'Startup Logistik Indonesia Raih Pendanaan Seri B 120 Juta Dolar AS',
    titleEn: 'Indonesian Logistics Startup Raises US$120 Million Series B Funding',
    excerpt: 'Pendanaan ini menjadi salah satu yang terbesar di sektor logistik Asia Tenggara tahun ini dan akan memperluas jaringan gudang otomatis.',
    excerptEn: 'The round is among the largest in Southeast Asia\'s logistics sector this year and will expand the automated warehouse network.',
    category: 'teknologi',
    author: 'Rina Marlina',
    image: 35,
    featured: true,
    views: 14880,
    daysAgo: 1.1,
    content: [
      'Startup logistik asal Indonesia mengumumkan perolehan pendanaan Seri B senilai 120 juta dolar AS yang dipimpin oleh konsorsium investor global. Pendanaan ini menjadi salah satu yang terbesar di sektor logistik Asia Tenggara tahun ini.',
      'Dana segar tersebut akan digunakan untuk memperluas jaringan gudang otomatis, mengembangkan teknologi perencanaan rute berbasis kecerdasan artifisial, dan memperkuat layanan logistik di daerah.',
      'Co-founder dan CEO perusahaan menyebut pendanaan ini sebagai pengakuan atas pertumbuhan bisnis yang mencapai tiga kali lipat dalam dua tahun terakhir, melayani lebih dari 40.000 pelaku usaha.',
      'Perusahaan berencana merekrut 500 tenaga kerja baru, termasuk insinyur perangkat lunak dan analis data, serta membuka pusat riset di Bandung dan Yogyakarta.',
      'Analis industri menilai sektor logistik digital Indonesia masih memiliki ruang tumbuh besar, didorong pesatnya adopsi e-commerce dan kebutuhan rantai pasok yang lebih efisien.',
    ],
    contentEn: [
      'An Indonesian logistics startup announced a US$120 million Series B round led by a consortium of global investors. The funding is among the largest in Southeast Asia\'s logistics sector this year.',
      'The fresh capital will be used to expand the automated warehouse network, develop AI-based route-planning technology, and strengthen logistics services in the regions.',
      'The company\'s co-founder and CEO called the funding recognition of business growth that has tripled over the past two years, serving more than 40,000 business customers.',
      'The company plans to hire 500 new workers, including software engineers and data analysts, and to open research centers in Bandung and Yogyakarta.',
      'Industry analysts say Indonesia\'s digital logistics sector still has plenty of room to grow, driven by rapid e-commerce adoption and the need for more efficient supply chains.',
    ],
  },
  {
    slug: 'gula-berlebih-anak-masa-digital',
    title: 'Pakar Ingatkan Bahaya Konsumsi Gula Berlebih pada Anak di Era Digital',
    titleEn: 'Experts Warn of Excessive Sugar Consumption in Children in the Digital Age',
    excerpt: 'Konsumsi gula harian anak Indonesia diperkirakan melampaui rekomendasi dua kali lipat, seiring masifnya makanan olahan dan minuman manis.',
    excerptEn: 'Daily sugar intake among Indonesian children is estimated to be double the recommendation, amid the proliferation of processed foods and sweet drinks.',
    category: 'kesehatan',
    author: 'Nadia Safitri',
    image: 16,
    featured: true,
    views: 18240,
    daysAgo: 1.3,
    content: [
      'Para pakar kesehatan mengingatkan kembali bahaya konsumsi gula berlebih pada anak di tengah paparan layar dan makanan olahan yang kian masif. Konsumsi gula harian anak Indonesia diperkirakan melampaui rekomendasi dua kali lipat.',
      'Asosiasi dokter anak mencatat peningkatan kasus obesitas dan gigi berlubang pada anak usia sekolah dalam lima tahun terakhir, yang sebagian besar berkaitan dengan minuman manis kemasan.',
      'Ketua perhimpunan endokrinologi anak menjelaskan bahwa kelebihan gula meningkatkan risiko diabetes tipe 2, gangguan metabolik, serta penurunan konsentrasi belajar pada anak.',
      'Pemerintah berencana memperketat aturan promosi minuman tinggi gula yang menyasar anak, termasuk pembatasan iklan pada platform digital dan kewajiban pelabelan nutrisi yang lebih jelas.',
      'Orang tua diimbau membatasi minuman manis, memperbanyak air putih, dan membiasakan pola makan seimbang dengan buah serta sayur sebagai bagian dari gaya hidup keluarga.',
    ],
    contentEn: [
      'Health experts are again warning about the dangers of excessive sugar consumption in children amid growing screen time and processed foods. Daily sugar intake among Indonesian children is estimated to be double the recommendation.',
      'The pediatric association has recorded rising cases of obesity and tooth decay among school-age children over the past five years, largely linked to packaged sweet drinks.',
      'The chair of the pediatric endocrinology society explained that excess sugar raises the risk of type 2 diabetes, metabolic disorders, and reduced concentration in learning.',
      'The government plans to tighten rules on promoting high-sugar drinks to children, including restrictions on advertising on digital platforms and clearer nutrition labeling requirements.',
      'Parents are urged to limit sweet drinks, drink more water, and build balanced eating habits with fruit and vegetables as part of family life.',
    ],
  },
  {
    slug: 'ffi-2026-daftar-nominasi',
    title: 'Festival Film Indonesia 2026 Umumkan Daftar Nominasi, "Senja di Ujung Kota" Memimpin',
    titleEn: 'Indonesian Film Festival 2026 Announces Nominations, "Senja di Ujung Kota" Leads',
    excerpt: 'Film drama "Senja di Ujung Kota" memimpin dengan 12 nominasi, disusul "Bumi yang Terlupakan" dengan sembilan nominasi.',
    excerptEn: 'The drama "Senja di Ujung Kota" leads with 12 nominations, followed by "Bumi yang Terlupakan" with nine.',
    category: 'hiburan',
    author: 'Laras Ayu',
    image: 38,
    featured: true,
    views: 12560,
    daysAgo: 1.8,
    content: [
      'Panitia Festival Film Indonesia 2026 mengumumkan daftar nominasi untuk 18 kategori. Film drama "Senja di Ujung Kota" memimpin perolehan nominasi dengan 12 kategori, disusul "Bumi yang Terlupakan" dengan sembilan nominasi.',
      'Kategori film cerita panjang tahun ini diramaikan lima judul yang dinilai juri mampu mengangkat cerita lokal dengan cara bercerita yang segar dan matang secara teknis.',
      'Kategori aktor dan aktris terbaik juga dihuni wajah-wajah baru yang tampil impresif, menandai regenerasi dunia perfilman nasional.',
      'Malam puncak penghargaan akan digelar pada November mendatang di Jakarta, disiarkan langsung ke seluruh provinsi serta platform streaming.',
      'Ketua panitia berharap festival ini tidak hanya menjadi ajang apresiasi, tetapi juga mendorong industri film Indonesia semakin percaya diri menembus pasar internasional.',
    ],
    contentEn: [
      'The organizing committee of the 2026 Indonesian Film Festival announced nominations across 18 categories. The drama "Senja di Ujung Kota" leads with 12 nominations, followed by "Bumi yang Terlupakan" with nine.',
      'This year\'s feature film category features five titles that the jury found capable of elevating local stories with fresh storytelling and technical maturity.',
      'The best actor and actress categories also feature impressive new faces, marking a regeneration of the national film industry.',
      'The awards night will be held in Jakarta this November, broadcast live to all provinces and streaming platforms.',
      'The committee chair hopes the festival will not only be a celebration of achievement but also encourage Indonesia\'s film industry to break into international markets with more confidence.',
    ],
  },
  {
    slug: 'asean-ketahanan-pangan-energi',
    title: 'Pemimpin ASEAN Sepakati Kerja Sama Ketahanan Pangan dan Energi Kawasan',
    titleEn: 'ASEAN Leaders Agree on Regional Food and Energy Security Cooperation',
    excerpt: 'Kesepakatan mencakup cadangan pangan darurat bersama, jaringan rantai pasok beras regional, dan percepatan transisi energi lintas batas.',
    excerptEn: 'The agreement covers a joint emergency food reserve, a regional rice supply chain network, and faster cross-border energy transition.',
    category: 'internasional',
    author: 'Hendra Wijaya',
    image: 22,
    featured: true,
    views: 9960,
    daysAgo: 2.2,
    content: [
      'Para pemimpin negara ASEAN menyepakati kerangka kerja sama ketahanan pangan dan energi kawasan dalam pertemuan tingkat tinggi yang berlangsung selama dua hari.',
      'Kesepakatan ini mencakup pembentukan cadangan pangan darurat bersama, jaringan rantai pasok beras regional, serta percepatan transisi energi melalui kerja sama pembangunan pembangkit terbarukan lintas batas.',
      'Dalam pernyataan bersama, para pemimpin menegaskan komitmen untuk memastikan harga pangan yang stabil dan akses energi yang terjangkau bagi seluruh warga kawasan.',
      'Sekretaris jenderal ASEAN menyebut implementasi akan dimulai dengan proyek percontohan di lima negara, termasuk uji coba mekanisme berbagi data stok pangan secara real-time.',
      'Pengamat kawasan menilai kesepakatan ini menjadi langkah strategis ASEAN di tengah ketidakpastian rantai pasok global dan dampak perubahan iklim terhadap produksi pangan.',
    ],
    contentEn: [
      'ASEAN leaders agreed on a framework for regional food and energy security cooperation at a two-day summit.',
      'The agreement includes establishing a joint emergency food reserve, a regional rice supply chain network, and accelerating the energy transition through cross-border cooperation on renewable power plants.',
      'In a joint statement, the leaders affirmed their commitment to ensuring stable food prices and affordable energy access for all people in the region.',
      'The ASEAN secretary-general said implementation will begin with pilot projects in five countries, including trials of a real-time food stock data-sharing mechanism.',
      'Regional analysts see the agreement as a strategic step for ASEAN amid global supply chain uncertainty and the impact of climate change on food production.',
    ],
  },
  {
    slug: 'ruu-perlindungan-data-pribadi-final',
    title: 'DPR dan Pemerintah Finalisasi RUU Perlindungan Data Pribadi',
    titleEn: 'House and Government Finalize Personal Data Protection Bill',
    excerpt: 'Sejumlah poin krusial disepakati, termasuk kewajiban lapor pelanggaran data dalam 72 jam dan pembentukan lembaga pengawas independen.',
    excerptEn: 'Key points were agreed, including a 72-hour data breach notification duty and the establishment of an independent supervisory authority.',
    category: 'politik',
    author: 'Fajar Ramadhan',
    image: 12,
    featured: true,
    views: 17330,
    daysAgo: 2.5,
    content: [
      'Dewan Perwakilan Rakyat dan pemerintah menyepakati sejumlah poin krusial dalam pembahasan Rancangan Undang-Undang Perlindungan Data Pribadi, membuka jalan bagi pengesahan pada masa sidang berikutnya.',
      'Poin yang disepakati antara lain kewajiban pengendali data memberitahukan pelanggaran data dalam 72 jam, pengenaan sanksi administratif bertingkat, serta pembentukan lembaga pengawas independen.',
      'Ketua panitia kerja menyebut kesepakatan ini merupakan hasil kompromi yang mengedepankan kepentingan masyarakat dan kesiapan dunia usaha.',
      'Praktisi keamanan siber menyambut baik perkembangan ini seraya mengingatkan bahwa keberhasilan undang-undang bergantung pada pengawasan yang efektif dan penegakan hukum yang konsisten.',
      'Setelah disahkan, pemerintah akan menyiapkan peraturan pelaksanaan, termasuk pedoman bagi sektor perbankan, kesehatan, dan platform digital.',
    ],
    contentEn: [
      'The House of Representatives and the government agreed on several crucial points in the deliberation of the Personal Data Protection Bill, paving the way for enactment in the next session.',
      'Agreed points include the obligation for data controllers to report data breaches within 72 hours, tiered administrative sanctions, and the establishment of an independent supervisory authority.',
      'The working committee chair called the agreement a compromise that prioritizes public interest and the readiness of the business community.',
      'Cybersecurity practitioners welcomed the development while reminding that the law\'s success depends on effective oversight and consistent enforcement.',
      'Once enacted, the government will prepare implementing regulations, including guidelines for the banking, health, and digital platform sectors.',
    ],
  },
  {
    slug: 'kurikulum-baru-berbasis-kompetensi',
    title: 'Kemendikbud Luncurkan Kurikulum Baru Berbasis Kompetensi dan Karakter',
    titleEn: 'Education Ministry Launches New Competency- and Character-Based Curriculum',
    excerpt: 'Kurikulum menekankan literasi, numerasi, dan berpikir kritis, dengan porsi proyek kolaboratif yang lebih besar dibandingkan hafalan materi.',
    excerptEn: 'The curriculum emphasizes literacy, numeracy, and critical thinking, with a greater share of collaborative projects over rote memorization.',
    category: 'pendidikan',
    author: 'Intan Permata',
    image: 29,
    featured: true,
    views: 11090,
    daysAgo: 3.1,
    content: [
      'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi meluncurkan kurikulum baru berbasis kompetensi dan karakter yang akan diterapkan secara bertahap mulai tahun ajaran 2027.',
      'Kurikulum ini menekankan penguasaan literasi, numerasi, dan keterampilan berpikir kritis, dengan porsi proyek kolaboratif yang lebih besar dibandingkan hafalan materi.',
      'Uji coba terbatas telah dilakukan di 500 sekolah di 34 provinsi selama dua tahun terakhir, dengan hasil evaluasi yang positif dari para guru dan orang tua.',
      'Menteri menyebut program pelatihan guru akan menjadi prioritas, karena kualitas pembelajaran sangat ditentukan oleh kesiapan pendidik di lapangan.',
      'Organisasi profesi guru menilai arah kurikulum ini relevan dengan kebutuhan abad ke-21, tetapi meminta pemerintah memastikan kesiapan sarana di daerah tertinggal.',
    ],
    contentEn: [
      'The Ministry of Education, Culture, Research, and Technology launched a new competency- and character-based curriculum to be rolled out gradually starting in the 2027 academic year.',
      'The curriculum emphasizes mastery of literacy, numeracy, and critical thinking skills, with a larger share of collaborative projects over rote memorization.',
      'A limited trial was conducted in 500 schools across 34 provinces over the past two years, with positive evaluations from teachers and parents.',
      'The minister said teacher training programs will be a priority, because the quality of learning depends heavily on the readiness of educators in the field.',
      'Teacher professional organizations called the curriculum\'s direction relevant to 21st-century needs, but asked the government to ensure facility readiness in underserved regions.',
    ],
  },
  {
    slug: 'bmkg-cuaca-ekstrem-indonesia-timur',
    title: 'BMKG Ingatkan Potensi Cuaca Ekstrem di Indonesia Bagian Timur',
    titleEn: 'BMKG Warns of Extreme Weather Potential in Eastern Indonesia',
    excerpt: 'Bibit siklon tropis diperkirakan memicu hujan lebat, angin kencang, dan gelombang tinggi di Maluku, Papua, dan sebagian Sulawesi.',
    excerptEn: 'A tropical cyclone seed is expected to trigger heavy rain, strong winds, and high waves in Maluku, Papua, and parts of Sulawesi.',
    category: 'nasional',
    author: 'Rizky Ananda',
    image: 7,
    featured: false,
    views: 13870,
    daysAgo: 3.4,
    content: [
      'Badan Meteorologi, Klimatologi, dan Geofisika mengeluarkan peringatan dini potensi cuaca ekstrem di sejumlah wilayah Indonesia bagian timur hingga sepekan ke depan.',
      'Bibit siklon tropis di Samudra Pasifik barat diperkirakan memicu hujan lebat, angin kencang, dan gelombang tinggi di wilayah Maluku, Papua, dan sebagian Sulawesi.',
      'Masyarakat pesisir dan nelayan diimbau tidak memaksakan diri melaut saat gelombang mencapai ketinggian di atas empat meter. Operator pelayaran diminta meningkatkan kewaspadaan.',
      'Kepala BMKG mengimbau pemerintah daerah menyiapkan langkah mitigasi, termasuk evakuasi dini bagi warga yang bermukim di bantaran sungai dan lereng rawan longsor.',
      'BMKG juga mengingatkan agar masyarakat tidak mudah mempercayai informasi cuaca dari sumber yang tidak dapat diverifikasi dan selalu memantau kanal resmi.',
    ],
    contentEn: [
      'The Meteorology, Climatology, and Geophysics Agency (BMKG) issued an early warning of potential extreme weather across parts of eastern Indonesia over the next week.',
      'A tropical cyclone seed in the western Pacific Ocean is expected to trigger heavy rain, strong winds, and high waves in Maluku, Papua, and parts of Sulawesi.',
      'Coastal communities and fishermen are advised not to push themselves out to sea when waves exceed four meters. Shipping operators are asked to raise their alertness.',
      'The BMKG chief urged regional governments to prepare mitigation measures, including early evacuation for residents living along riverbanks and landslide-prone slopes.',
      'BMKG also reminded the public not to easily trust weather information from unverifiable sources and to always monitor official channels.',
    ],
  },
  {
    slug: 'bank-digital-transaksi-melesat',
    title: 'Transaksi Bank Digital di Indonesia Melesat 45 Persen Sepanjang Semester I',
    titleEn: 'Digital Bank Transactions in Indonesia Surge 45 Percent in H1',
    excerpt: 'Pertumbuhan didorong perluasan ekosistem QRIS dan layanan tabungan digital yang mudah diakses masyarakat luas.',
    excerptEn: 'Growth was driven by the expansion of the QRIS ecosystem and digital savings services that are easy for the public to access.',
    category: 'teknologi',
    author: 'Yoga Pradana',
    image: 34,
    featured: false,
    views: 10460,
    daysAgo: 4.2,
    content: [
      'Nilai transaksi bank digital di Indonesia melesat 45 persen pada semester pertama 2026 dibandingkan periode yang sama tahun lalu, menegaskan semakin besarnya adopsi layanan keuangan digital.',
      'Bank Indonesia mencatat transaksi digital banking mencapai ratusan juta transaksi per bulan, didorong perluasan ekosistem QRIS dan layanan tabungan digital yang mudah diakses.',
      'Direktur utama salah satu bank digital menyebut pertumbuhan dipicu peningkatan pengguna muda serta fitur baru seperti tabungan berbunga harian dan asuransi mikro terintegrasi.',
      'Otoritas jasa keuangan mengingatkan pentingnya keamanan siber dan literasi, seiring meningkatnya kasus penipuan digital yang menyasar nasabah baru.',
      'Pengamat menilai persaingan akan semakin ketat, dan bank digital yang mampu menjaga kepercayaan serta memberikan pengalaman pengguna terbaik akan memenangkan pasar jangka panjang.',
    ],
    contentEn: [
      'The value of digital bank transactions in Indonesia surged 45 percent in the first half of 2026 compared with the same period last year, confirming the growing adoption of digital financial services.',
      'Bank Indonesia recorded digital banking transactions reaching hundreds of millions per month, driven by the expanding QRIS ecosystem and easily accessible digital savings services.',
      'The chief executive of one digital bank attributed the growth to more young users and new features such as daily-interest savings and integrated micro-insurance.',
      'The financial services authority reminded of the importance of cybersecurity and literacy, amid rising digital fraud cases targeting new customers.',
      'Analysts say competition will intensify, and digital banks that maintain trust and deliver the best user experience will win in the long run.',
    ],
  },
  {
    slug: 'kesepakatan-pendanaan-hijau-global',
    title: 'Konferensi Iklim Global Ditutup dengan Kesepakatan Pendanaan Hijau 300 Miliar Dolar AS',
    titleEn: 'Global Climate Conference Closes with US$300 Billion Green Finance Deal',
    excerpt: 'Kesepakatan mencakup dukungan adaptasi, transisi energi, serta pendanaan untuk kerugian dan kerusakan akibat perubahan iklim.',
    excerptEn: 'The agreement covers adaptation support, energy transition, and funding for loss and damage caused by climate change.',
    category: 'internasional',
    author: 'Clara Manurung',
    image: 32,
    featured: false,
    views: 13450,
    daysAgo: 4.6,
    content: [
      'Konferensi iklim global tahun ini ditutup dengan kesepakatan pendanaan hijau senilai 300 miliar dolar AS per tahun untuk negara berkembang, setelah negosiasi alot yang berlangsung hingga hari terakhir.',
      'Kesepakatan ini mencakup dukungan adaptasi, transisi energi, serta pendanaan untuk kerugian dan kerusakan akibat dampak perubahan iklim.',
      'Delegasi negara berkembang menyebut angka ini sebagai langkah maju, meski menilai masih di bawah kebutuhan nyata yang diperkirakan mencapai satu triliun dolar AS per tahun.',
      'Pemerintah Indonesia menyambut kesepakatan tersebut dan menyatakan siap mengajukan proposal proyek transisi energi yang telah disiapkan, termasuk pengembangan energi surya dan panas bumi.',
      'Pengamat lingkungan menekankan bahwa kunci keberhasilan terletak pada implementasi dan transparansi penyaluran dana, bukan sekadar komitmen di atas kertas.',
    ],
    contentEn: [
      'This year\'s global climate conference closed with a green finance deal worth US$300 billion per year for developing countries, after tough negotiations that lasted until the final day.',
      'The agreement covers adaptation support, energy transition, and funding for loss and damage caused by the impacts of climate change.',
      'Developing country delegates called the figure a step forward, although they said it remains below real needs estimated at US$1 trillion per year.',
      'The Indonesian government welcomed the agreement and said it is ready to submit prepared energy transition project proposals, including solar and geothermal energy development.',
      'Environmental analysts stressed that success hinges on implementation and transparency in disbursing funds, not just commitments on paper.',
    ],
  },
];

/* --------------------------- Artikel isian (template) --------------------------- */

const FILLER = {
  nasional: [
    { title: 'Pemerintah Percepat Pembangunan Infrastruktur di Kawasan Timur Indonesia', titleEn: 'Government Accelerates Infrastructure Development in Eastern Indonesia', excerpt: 'Sejumlah proyek jalan, pelabuhan, dan pembangkit listrik ditargetkan rampung lebih awal untuk mengejar pemerataan pembangunan.', excerptEn: 'A number of road, port, and power plant projects are targeted to finish early to catch up on development equity.' },
    { title: 'Program Makan Bergizi Gratis Diperluas ke 12 Provinsi', titleEn: 'Free Nutritious Meal Program Expanded to 12 Provinces', excerpt: 'Perluasan menyasar 3,5 juta siswa sekolah dasar dan ibu hamil di daerah dengan prevalensi stunting tertinggi.', excerptEn: 'The expansion reaches 3.5 million elementary school students and pregnant women in areas with the highest stunting prevalence.' },
    { title: 'Mudik Lebaran 2026 Diprediksi Capai 160 Juta Pergerakan', titleEn: '2026 Eid Homecoming Predicted to Reach 160 Million Trips', excerpt: 'Kementerian Perhubungan menyiapkan rekayasa lalu lintas dan armada tambahan untuk mengantisipasi lonjakan pemudik.', excerptEn: 'The Transportation Ministry is preparing traffic management and extra fleets to anticipate the surge in travelers.' },
    { title: 'Perpusnas Dorong Literasi Digital di Daerah 3T', titleEn: 'National Library Promotes Digital Literacy in Disadvantaged Regions', excerpt: 'Perpustakaan keliling digital dan jaringan internet gratis mulai menjangkau wilayah terdepan, terluar, dan tertinggal.', excerptEn: 'Digital mobile libraries and free internet access are reaching the country\'s outermost, frontier, and disadvantaged regions.' },
    { title: 'Rehabilitasi Mangrove Pesisir Utara Jawa Capai 40 Ribu Hektare', titleEn: 'North Java Coast Mangrove Rehabilitation Reaches 40,000 Hectares', excerpt: 'Program nasional pemulihan ekosistem pesisir melibatkan masyarakat lokal dalam pembibitan dan penanaman.', excerptEn: 'The national coastal ecosystem restoration program involves local communities in nurseries and planting.' },
  ],
  politik: [
    { title: 'KPU Sosialisasi Tahapan Pemilu Serentak kepada Generasi Muda', titleEn: 'Election Commission Promotes Simultaneous Election Stages to Young Voters', excerpt: 'Sosialisasi memanfaatkan kanal media sosial dan kampus untuk menjangkau pemilih pemula di seluruh provinsi.', excerptEn: 'The outreach uses social media channels and campuses to reach first-time voters across all provinces.' },
    { title: 'DPR Bahas RUU Perlindungan Pekerja Rumah Tangga', titleEn: 'House Discusses Domestic Workers Protection Bill', excerpt: 'Pembahasan mencakup jaminan upah layak, jaminan sosial, dan mekanisme penyaluran melalui lembaga penyalur resmi.', excerptEn: 'The discussion covers fair wage guarantees, social security, and placement mechanisms through licensed agencies.' },
    { title: 'Pemerintah dan DPR Sepakat Bahas RAPBN Tahun Depan Lebih Awal', titleEn: 'Government and House Agree to Discuss Next Year\'s Budget Earlier', excerpt: 'Pembahasan lebih awal dinilai memberi ruang evaluasi program prioritas dan serapan anggaran yang lebih baik.', excerptEn: 'Earlier discussion is seen as giving room to evaluate priority programs and improve budget absorption.' },
    { title: 'KPK Dorong Percepatan Digitalisasi LHKPN bagi Pejabat Publik', titleEn: 'KPK Pushes Faster Digitization of Wealth Reports for Public Officials', excerpt: 'Digitalisasi memudahkan pengawasan dan mempercepat proses verifikasi laporan harta kekayaan penyelenggara negara.', excerptEn: 'Digitization eases oversight and speeds up verification of state officials\' wealth reports.' },
    { title: 'Partai Politik Diminta Perkuat Kaderisasi Menjelang Kontestasi Daerah', titleEn: 'Political Parties Urged to Strengthen Cadre Development Ahead of Regional Contests', excerpt: 'Pengamat menilai kaderisasi berbasis gagasan lebih penting daripada sekadar strategi elektoral jangka pendek.', excerptEn: 'Analysts say idea-based cadre development matters more than short-term electoral strategy.' },
  ],
  ekonomi: [
    { title: 'Ekspor Kopi Indonesia Naik 12 Persen, Tembus Pasar Eropa', titleEn: 'Indonesian Coffee Exports Rise 12 Percent, Break into European Market', excerpt: 'Permintaan kopi spesialti Indonesia terus tumbuh, didorong tren keberlanjutan dan kualitas biji yang membaik.', excerptEn: 'Demand for Indonesian specialty coffee keeps growing, driven by sustainability trends and improving bean quality.' },
    { title: 'BI Pertahankan Suku Bunga Acuan untuk Jaga Stabilitas Rupiah', titleEn: 'Bank Indonesia Holds Key Rate to Keep Rupiah Stable', excerpt: 'Bank Indonesia menilai ruang pelonggaran masih terbatas di tengah ketidakpastian perekonomian global.', excerptEn: 'Bank Indonesia sees limited room for easing amid global economic uncertainty.' },
    { title: 'Lebih dari 30 Juta UMKM Masuk Ekosistem Digital', titleEn: 'More Than 30 Million MSMEs Join the Digital Ecosystem', excerpt: 'Program onboarding UMKM terus digenjot dengan pendampingan, pelatihan, dan insentif transaksi digital.', excerptEn: 'The MSME onboarding program continues to be pushed with mentoring, training, and digital transaction incentives.' },
    { title: 'Pariwisata Bali Catat Kenaikan Kunjungan Wisman 20 Persen', titleEn: 'Bali Tourism Records 20 Percent Increase in Foreign Visitors', excerpt: 'Perbaikan konektivitas penerbangan dan promosi destinasi berkelanjutan menjadi pendorong utama pertumbuhan.', excerptEn: 'Better flight connectivity and promotion of sustainable destinations are the main growth drivers.' },
    { title: 'Bulog Genjot Penyerapan Gabah Petani untuk Jaga Stabilitas Harga', titleEn: 'Bulog Boosts Rice Paddy Purchases from Farmers to Keep Prices Stable', excerpt: 'Penyerapan gabah kering panen ditingkatkan guna melindungi pendapatan petani dan menjaga inflasi pangan.', excerptEn: 'Purchases of harvested dry paddy are being increased to protect farmers\' incomes and keep food inflation in check.' },
  ],
  teknologi: [
    { title: 'Indonesia Masuk 10 Besar Negara Adopsi AI Tercepat di Asia Tenggara', titleEn: 'Indonesia Among Top 10 Fastest AI-Adopting Countries in Southeast Asia', excerpt: 'Laporan global mencatat pemanfaatan kecerdasan artifisial tumbuh pesat di sektor jasa, ritel, dan kesehatan.', excerptEn: 'A global report notes artificial intelligence use is growing fast in services, retail, and health sectors.' },
    { title: 'Pengembang Lokal Luncurkan Dompet Digital Ramah UMKM', titleEn: 'Local Developers Launch MSME-Friendly Digital Wallet', excerpt: 'Aplikasi baru menawarkan biaya transaksi lebih rendah dan pencatatan keuangan otomatis untuk pelaku usaha kecil.', excerptEn: 'The new app offers lower transaction fees and automatic bookkeeping for small business owners.' },
    { title: 'Kemenkominfo Siapkan Regulasi Baru untuk Kecerdasan Artifisial', titleEn: 'Communications Ministry Prepares New Artificial Intelligence Regulation', excerpt: 'Regulasi akan mengatur tata kelola data, transparansi algoritma, dan mekanisme pengawasan penggunaan AI.', excerptEn: 'The regulation will govern data management, algorithm transparency, and oversight mechanisms for AI use.' },
    { title: 'Startup EdTech Kembangkan Asisten Belajar Berbasis AI', titleEn: 'EdTech Startup Develops AI-Based Learning Assistant', excerpt: 'Asisten belajar personal dapat menyesuaikan materi dengan kemampuan dan gaya belajar masing-masing siswa.', excerptEn: 'The personal learning assistant can tailor material to each student\'s ability and learning style.' },
    { title: 'Pasar Smartphone 5G di Indonesia Tumbuh Dua Digit', titleEn: 'Indonesia\'s 5G Smartphone Market Grows in Double Digits', excerpt: 'Penetrasi jaringan 5G yang meluas dan harga perangkat yang semakin terjangkau mendorong pertumbuhan pasar.', excerptEn: 'Wider 5G network coverage and increasingly affordable devices drive market growth.' },
  ],
  olahraga: [
    { title: 'Sirkuit Mandalika Siap Gelar MotoGP dengan Kapasitas Penuh', titleEn: 'Mandalika Circuit Ready to Host MotoGP at Full Capacity', excerpt: 'Perbaikan lintasan dan penambahan tribun selesai, panitia memperkirakan 150 ribu penonton selama akhir pekan balapan.', excerptEn: 'Track repairs and grandstand additions are complete; organizers expect 150,000 spectators over the race weekend.' },
    { title: 'Pebulu Tangkis Tunggal Putra Indonesia Melaju ke Perempat Final Kejuaraan Asia', titleEn: 'Indonesian Men\'s Singles Shuttler Advances to Asian Championship Quarterfinals', excerpt: 'Kemenangan dua gim langsung memastikan langkah atlet andalan ke babak delapan besar turnamen bergengsi itu.', excerptEn: 'A straight-games win secured the star athlete\'s place in the last eight of the prestigious tournament.' },
    { title: 'PSSI Umumkan Skuad Timnas untuk Kualifikasi Piala Dunia', titleEn: 'PSSI Announces National Team Squad for World Cup Qualifiers', excerpt: 'Sebanyak 26 pemain dipanggil, termasuk tiga wajah baru dari kompetisi domestik yang tampil konsisten.', excerptEn: 'Twenty-six players were called up, including three newcomers from the domestic league who have performed consistently.' },
    { title: 'Tim Bulu Tangkis Putri Rebut Gelar Beregu Asia', titleEn: 'Indonesian Women\'s Badminton Team Wins Asian Team Title', excerpt: 'Kemenangan 3-1 di partai final menjadi gelar pertama Indonesia di ajang beregu putri dalam dua dekade.', excerptEn: 'The 3-1 win in the final is Indonesia\'s first women\'s team title in two decades.' },
    { title: 'Atlet Angkat Besi Indonesia Sabet Dua Emas di Kejuaraan Asia', titleEn: 'Indonesian Weightlifters Grab Two Golds at Asian Championship', excerpt: 'Prestasi ini menambah modal atlet menuju kualifikasi Olimpiade tahun depan.', excerptEn: 'The achievement adds to the athletes\' momentum toward Olympic qualification next year.' },
  ],
  hiburan: [
    { title: 'Konser Amal Musisi Indonesia Kumpulkan Donasi Rp15 Miliar', titleEn: 'Indonesian Musicians\' Charity Concert Raises Rp15 Billion in Donations', excerpt: 'Dana disalurkan untuk korban bencana alam dan program beasiswa anak daerah terdampak.', excerptEn: 'The funds go to natural disaster victims and scholarship programs for children in affected regions.' },
    { title: 'Film Animasi Lokal "Petualangan Si Kancil" Tembus 3 Juta Penonton', titleEn: 'Local Animated Film "Petualangan Si Kancil" Passes 3 Million Viewers', excerpt: 'Kesuksesan ini menjadikannya film animasi Indonesia terlaris sepanjang sejarah perfilman nasional.', excerptEn: 'The success makes it the best-selling Indonesian animated film in the history of national cinema.' },
    { title: 'Platform Streaming Global Siapkan Serial Dokumenter Kuliner Nusantara', titleEn: 'Global Streaming Platform Prepares Archipelago Culinary Documentary Series', excerpt: 'Serial delapan episode akan menyusuri ragam kuliner dari Sabang sampai Merauke bersama koki-koki lokal.', excerptEn: 'The eight-episode series will explore culinary variety from Sabang to Merauke with local chefs.' },
    { title: 'Grup Musik Tanah Air Rilis Album Kedua dengan Sentuhan Orkestra', titleEn: 'Homegrown Music Group Releases Second Album with Orchestral Touch', excerpt: 'Kolaborasi dengan orkestra simfoni memberi warna baru pada aransemen lagu-lagu yang sudah dikenal luas.', excerptEn: 'The collaboration with a symphony orchestra adds a new color to arrangements of well-known songs.' },
    { title: 'Pameran Seni Rupa Kontemporer di Jakarta Tarik 200 Ribu Pengunjung', titleEn: 'Contemporary Art Exhibition in Jakarta Draws 200,000 Visitors', excerpt: 'Pameran bertema keberlanjutan menampilkan karya 120 seniman dari berbagai generasi.', excerptEn: 'The sustainability-themed exhibition features works by 120 artists from various generations.' },
  ],
  kesehatan: [
    { title: 'Kasus DBD Menurun 35 Persen Berkat Gerakan 3M Plus', titleEn: 'Dengue Cases Drop 35 Percent Thanks to 3M Plus Movement', excerpt: 'Pemberantasan sarang nyamuk dan fogging terarah menekan angka kasus demam berdarah di wilayah urban.', excerptEn: 'Mosquito breeding site elimination and targeted fogging are driving down dengue cases in urban areas.' },
    { title: 'RS Rujukan Nasional Perluas Layanan Telemedicine untuk Pasien Jantung', titleEn: 'National Referral Hospital Expands Telemedicine for Heart Patients', excerpt: 'Konsultasi jarak jauh dan pemantauan kondisi pasien kronis kini dapat dilakukan dari rumah.', excerptEn: 'Remote consultations and monitoring of chronic patients can now be done from home.' },
    { title: 'Pola Tidur Sehat: Pakar Bagikan Tips Mengatasi Insomnia', titleEn: 'Healthy Sleep Habits: Experts Share Tips to Overcome Insomnia', excerpt: 'Kualitas tidur yang buruk berkaitan dengan stres dan paparan layar menjelang tidur pada usia produktif.', excerptEn: 'Poor sleep quality is linked to stress and screen exposure before bed among working-age adults.' },
    { title: 'Cakupan Imunisasi Anak Pulih Capai 92 Persen Secara Nasional', titleEn: 'Child Immunization Coverage Recovers to 92 Percent Nationally', excerpt: 'Kegiatan imunisasi kejar di posyandu dan sekolah mendorong pemulihan cakupan pascapandemi.', excerptEn: 'Catch-up immunization drives at community health posts and schools are boosting post-pandemic coverage.' },
    { title: 'Kemenkes Luncurkan Aplikasi Skrining Kesehatan Gratis bagi Lansia', titleEn: 'Health Ministry Launches Free Health Screening App for Seniors', excerpt: 'Aplikasi membantu deteksi dini penyakit tidak menular dan menjadwalkan pemeriksaan di fasilitas terdekat.', excerptEn: 'The app helps with early detection of non-communicable diseases and schedules check-ups at nearby facilities.' },
  ],
  internasional: [
    { title: 'KTT G20 Bahas Kolaborasi Ekonomi Digital dan Perubahan Iklim', titleEn: 'G20 Summit Discusses Digital Economy Collaboration and Climate Change', excerpt: 'Para pemimpin ekonomi terbesar dunia sepakat memperkuat kerja sama tata kelola digital lintas negara.', excerptEn: 'The world\'s largest economies agreed to strengthen cross-border digital governance cooperation.' },
    { title: 'Uni Eropa Longgarkan Aturan Visa bagi Wisatawan Asia Tenggara', titleEn: 'European Union Eases Visa Rules for Southeast Asian Travelers', excerpt: 'Kebijakan baru diharapkan meningkatkan kunjungan wisatawan sekaligus mempererat hubungan ekonomi.', excerptEn: 'The new policy is expected to boost tourist arrivals while deepening economic ties.' },
    { title: 'Negara-negara Teluk Perkuat Investasi Energi Terbarukan', titleEn: 'Gulf States Strengthen Renewable Energy Investment', excerpt: 'Portofolio investasi hijau kawasan itu diperkirakan tumbuh dua kali lipat dalam lima tahun ke depan.', excerptEn: 'The region\'s green investment portfolio is expected to double within five years.' },
    { title: 'WTO Dorong Reformasi Perdagangan Global untuk Negara Berkembang', titleEn: 'WTO Pushes Global Trade Reform for Developing Countries', excerpt: 'Negara berkembang meminta akses pasar yang lebih adil dan mekanisme penyelesaian sengketa yang efektif.', excerptEn: 'Developing countries are asking for fairer market access and effective dispute settlement mechanisms.' },
    { title: 'Indonesia dan Jepang Teken Kerja Sama Riset Kelautan', titleEn: 'Indonesia and Japan Sign Marine Research Cooperation', excerpt: 'Kerja sama mencakup pemantauan ekosistem laut dalam, budi daya berkelanjutan, dan pertukaran peneliti.', excerptEn: 'The cooperation covers deep-sea ecosystem monitoring, sustainable aquaculture, and researcher exchanges.' },
  ],
  pendidikan: [
    { title: 'Beasiswa LPDP Dibuka, Kuota Naik 40 Persen', titleEn: 'LPDP Scholarship Open, Quota Up 40 Percent', excerpt: 'Pendaftaran gelombang pertama dibuka Agustus ini dengan prioritas bidang sains, teknologi, dan seni budaya.', excerptEn: 'First-wave registration opens this August, prioritizing science, technology, and arts and culture.' },
    { title: 'Program Pertukaran Pelajar Nusantara Diikuti 8.000 Mahasiswa', titleEn: 'Archipelago Student Exchange Program Attracts 8,000 Students', excerpt: 'Pertukaran antarpulau bertujuan memperkuat toleransi dan pemahaman keberagaman budaya sejak kampus.', excerptEn: 'The inter-island exchange aims to strengthen tolerance and understanding of cultural diversity from campus.' },
    { title: 'Sekolah Adiwiyata Bertambah, Pendidikan Lingkungan Kian Digencarkan', titleEn: 'More Adiwiyata Schools, Environmental Education Stepped Up', excerpt: 'Kurikulum dan kegiatan sekolah ramah lingkungan terus diperluas di jenjang dasar dan menengah.', excerptEn: 'Environmentally friendly curricula and school activities keep expanding at primary and secondary levels.' },
    { title: 'Guru Penggerak Berperan Besar dalam Transformasi Pembelajaran', titleEn: 'Driving Teachers Play a Major Role in Learning Transformation', excerpt: 'Evaluasi nasional menunjukkan pembelajaran aktif meningkat di sekolah yang dipimpin guru penggerak.', excerptEn: 'National evaluations show active learning has increased in schools led by driving teachers.' },
    { title: 'Perpustakaan Digital Gratis Diperluas ke Seluruh Provinsi', titleEn: 'Free Digital Library Expanded to All Provinces', excerpt: 'Akses buku digital dan modul pembelajaran kini dapat dinikmati melalui gawai di daerah terpencil.', excerptEn: 'Access to digital books and learning modules can now be enjoyed via devices in remote areas.' },
  ],
};

const PARAGRAPH_POOL = [
  'Menurut catatan redaksi, perkembangan ini sejalan dengan arah kebijakan nasional yang menitikberatkan pada pemerataan dan keberlanjutan.',
  'Para pengamat menilai langkah ini merupakan bagian dari transformasi jangka panjang yang membutuhkan sinergi antara pemerintah pusat, daerah, dan pelaku industri.',
  'Sementara itu, sejumlah pihak menyambut positif kebijakan tersebut, meski tetap meminta adanya pengawasan yang transparan dan akuntabel.',
  'Data yang dihimpun dari berbagai sumber menunjukkan tren yang terus membaik dalam beberapa bulan terakhir, didorong oleh meningkatnya partisipasi masyarakat.',
  'Pemerintah berkomitmen untuk terus mendengar masukan dari seluruh pemangku kepentingan sebelum mengambil keputusan lebih lanjut.',
  'Dalam kesempatan terpisah, koordinator penelitian di lembaga kajian publik menyebut bahwa implementasi di lapangan menjadi ujian utama dari kebijakan ini.',
  'Realisasi program ini ditargetkan rampung secara bertahap hingga akhir tahun, dengan evaluasi berkala setiap tiga bulan.',
  'Masyarakat diimbau untuk tetap mengikuti perkembangan informasi dari kanal resmi agar tidak terjebak pada berita yang tidak terverifikasi.',
  'Berbagai pihak berharap kebijakan ini membawa dampak nyata bagi masyarakat luas, bukan hanya berhenti pada tataran dokumen.',
  'Pemerintah daerah diminta menyiapkan anggaran dan sumber daya manusia pendukung agar program dapat berjalan optimal di lapangan.',
  'Dalam jangka menengah, kebijakan ini diharapkan mendorong pertumbuhan ekonomi yang inklusif dan merata di seluruh wilayah.',
  'Sejumlah organisasi masyarakat sipil akan memantau pelaksanaan program ini dan melaporkan temuannya secara berkala kepada publik.',
];

// Versi bahasa Inggris dari PARAGRAPH_POOL (indeks sama dengan versi Indonesia),
// dipakai untuk menyusun isi (content_en) artikel isian.
const PARAGRAPH_POOL_EN = [
  'According to the editorial desk, this development is in line with national policy directions that emphasize equity and sustainability.',
  'Analysts consider this step part of a long-term transformation that requires synergy between the central government, regional governments, and industry players.',
  'Meanwhile, several parties welcomed the policy, while still calling for transparent and accountable oversight.',
  'Data gathered from various sources shows a steadily improving trend in recent months, driven by growing public participation.',
  'The government is committed to continuing to listen to input from all stakeholders before making further decisions.',
  'On a separate occasion, a research coordinator at a public policy institute said field implementation is the main test of this policy.',
  'Implementation of this program is targeted to be completed gradually by year-end, with periodic evaluations every three months.',
  'The public is advised to keep following information from official channels so as not to fall for unverified news.',
  'Many hope this policy brings real impact to the wider community, rather than stopping at the document level.',
  'Regional governments are asked to prepare budgets and supporting human resources so the program can run optimally in the field.',
  'In the medium term, this policy is expected to drive inclusive and equitable economic growth across all regions.',
  'A number of civil society organizations will monitor the program\'s implementation and report their findings to the public periodically.',
];

/* -------------------------------- Helper RNG -------------------------------- */

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function daysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(7 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

/* ------------------------------ Autentikasi ------------------------------ */

// Format hash: "salt:hash" (scrypt, 64 byte) — kompatibel dengan web/src/lib/auth.ts
// Penulis yang diizinkan masuk (login Google). Email default dari seed + email
// tambahan dari env AUTHOR_EMAILS (dipisah koma).
const DEFAULT_AUTHOR_EMAILS = ['fathandwipayana@gmail.com'];
const EXTRA_AUTHOR_EMAILS = (process.env.AUTHOR_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const AUTHOR_EMAILS = [...new Set([...DEFAULT_AUTHOR_EMAILS, ...EXTRA_AUTHOR_EMAILS])];

/* ---------------------------------- Seed ---------------------------------- */

async function main() {
  const supabase = getSupabase();

  // --- Skema (opsional): dibuat otomatis hanya bila DATABASE_URL tersedia ---
  let pool = null;
  if (DATABASE_URL) {
    console.log('> Membuat skema database (DATABASE_URL tersedia)...');
    const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
    // Supabase (host *.supabase.co / *.supabase.com) mewajibkan SSL — aktifkan
    // otomatis kecuali DSN sudah menentukan sslmode sendiri.
    const ssl = /sslmode=/.test(DATABASE_URL)
      ? undefined
      : /supabase\.(co|com)/.test(DATABASE_URL)
        ? { rejectUnauthorized: false }
        : undefined;
    // Paksa IPv4 (family: 4) — beberapa host Supabase hanya menerbitkan AAAA
    // (IPv6) yang tidak terjangkau di jaringan ini (ENETUNREACH).
    pool = new Pool({ connectionString: DATABASE_URL, ssl, family: 4, max: 5 });
    await pool.query(schemaSql);
  } else {
    console.log('> DATABASE_URL tidak diatur — lewati pembuatan skema.');
    console.log(`> Bila skema belum ada, tempel isi ${SCHEMA_SQL_PATH} di SQL editor Supabase.`);
  }

  console.log('> Menyiapkan kategori...');
  const { data: catRows, error: catErr } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select('id, slug');
  if (catErr) throw catErr;
  const catIdBySlug = new Map((catRows ?? []).map((c) => [c.slug, c.id]));

  console.log('> Menyiapkan daftar penulis yang diizinkan (Google OAuth)...');
  const { error: sessionsErr } = await supabase
    .from('sessions')
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (sessionsErr) throw sessionsErr;
  const { error: authorsErr } = await supabase
    .from('authors')
    .upsert(AUTHOR_EMAILS.map((email) => ({ email })), {
      onConflict: 'email',
      ignoreDuplicates: true,
    });
  if (authorsErr) throw authorsErr;
  console.log(`> Penulis yang diizinkan: ${AUTHOR_EMAILS.join(', ')} (tambah via env AUTHOR_EMAILS)`);

  const rng = mulberry32(20260731);
  let inserted = 0;

  // Slug yang sudah ada — artikel lama hanya di-backfill kolom *_en (kolom
  // Indonesia, published_at, views, featured dipertahankan); artikel baru
  // di-insert penuh. (Setara dengan ON CONFLICT DO UPDATE yang lama.)
  const { data: existingRows } = await supabase.from('articles').select('slug');
  const existingSlugs = new Set((existingRows ?? []).map((r) => r.slug));

  const insertArticle = async (a) => {
    if (existingSlugs.has(a.slug)) {
      const { error } = await supabase
        .from('articles')
        .update({
          title_en: a.titleEn ?? null,
          excerpt_en: a.excerptEn ?? null,
          content_en: a.contentEn ?? null,
        })
        .eq('slug', a.slug);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('articles').insert({
      slug: a.slug,
      title: a.title,
      title_en: a.titleEn ?? null,
      excerpt: a.excerpt,
      excerpt_en: a.excerptEn ?? null,
      content: a.content,
      content_en: a.contentEn ?? null,
      category_id: catIdBySlug.get(a.category),
      author: a.author,
      image_url: a.image,
      published_at: a.publishedAt.toISOString(),
      views: a.views,
      featured: a.featured,
    });
    if (error) throw error;
    inserted += 1;
  };

  console.log('> Menyisipkan artikel utama...');
  for (const a of FEATURED) {
    await insertArticle({
      slug: a.slug,
      title: a.title,
      titleEn: a.titleEn,
      excerpt: a.excerpt,
      excerptEn: a.excerptEn,
      content: a.content.join('\n\n'),
      contentEn: a.contentEn.join('\n\n'),
      category: a.category,
      author: a.author,
      image: IMAGES[a.image],
      publishedAt: daysAgoDate(a.daysAgo),
      views: a.views,
      featured: a.featured,
    });
  }

  console.log('> Menyisipkan artikel isian...');
  const fillerJobs = [];
  for (const [catSlug, items] of Object.entries(FILLER)) {
    items.forEach((item, i) => {
      const paraCount = 4 + Math.floor(rng() * 3); // 4-6 paragraf
      const picked = [];
      const pickedEn = [];
      for (let p = 0; p < paraCount; p++) {
        const idx = Math.floor(rng() * PARAGRAPH_POOL.length);
        picked.push(PARAGRAPH_POOL[idx]);
        pickedEn.push(PARAGRAPH_POOL_EN[idx]);
      }
      const intro = item.excerpt;
      const content = [intro, ...picked].join('\n\n');
      const contentEn = [item.excerptEn, ...pickedEn].join('\n\n');
      const slug = `${slugify(item.title)}-${catSlug}-${i + 1}`;
      fillerJobs.push(
        insertArticle({
          slug,
          title: item.title,
          titleEn: item.titleEn,
          excerpt: item.excerpt,
          excerptEn: item.excerptEn,
          content,
          contentEn,
          category: catSlug,
          author: AUTHORS[Math.floor(rng() * AUTHORS.length)],
          image: IMAGES[Math.floor(rng() * IMAGES.length)],
          publishedAt: daysAgoDate(2 + rng() * 28),
          views: Math.floor(rng() * 12000),
          featured: false,
        })
      );
    });
  }
  await Promise.all(fillerJobs);

  const { count: total } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true });
  const { count: catTotal } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true });
  console.log(`> Selesai. ${catTotal} kategori, ${total} artikel (baru: ${inserted}).`);

  if (pool) await pool.end();
}

main().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
