/**
 * Identitas situs yang dapat diubah klien lewat environment variables (.env /
 * docker-compose). Semua nilai opsional: kosong ('') berarti baris terkait
 * disembunyikan di halaman /about, /terms, dan /contact.
 *
 * Hanya untuk server components — variabel non-NEXT_PUBLIC tidak tersedia di
 * browser, dan perubahan nilainya berlaku setelah container di-restart.
 */

const readEnv = (key: string): string => process.env[key]?.trim() ?? '';

/**
 * Tanggal pembaruan Syarat & Ketentuan — konstanta tetap, BUKAN `new Date()`
 * (halaman bersifat force-dynamic sehingga tanggal berjalan akan menyesatkan).
 * Format ISO YYYY-MM-DD; pelokalan tampilan dilakukan di halaman.
 */
export const SITE_TERMS_UPDATED = '2026-08-01';

export interface EditorialTeam {
  editorInChief: string;
  managingEditor: string;
}

/** Pimpinan redaksi untuk halaman /about ('' = baris disembunyikan). */
export function getEditorialTeam(): EditorialTeam {
  return {
    editorInChief: readEnv('SITE_EDITOR_IN_CHIEF'),
    managingEditor: readEnv('SITE_MANAGING_EDITOR'),
  };
}

export interface SiteContacts {
  email: string;
  emailEditorial: string;
  emailAds: string;
  phone: string;
  address: string;
}

/** Kanal kontak untuk halaman /contact dan penutup /terms ('' = disembunyikan). */
export function getSiteContacts(): SiteContacts {
  return {
    email: readEnv('CONTACT_EMAIL'),
    emailEditorial: readEnv('CONTACT_EMAIL_EDITORIAL'),
    emailAds: readEnv('CONTACT_EMAIL_ADS'),
    phone: readEnv('CONTACT_PHONE'),
    address: readEnv('CONTACT_ADDRESS'),
  };
}
