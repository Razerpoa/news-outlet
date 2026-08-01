import 'server-only';
import { cookies } from 'next/headers';
import { LANG_COOKIE, isLang, type Lang } from './lang';

/** Baca bahasa aktif dari cookie `kn_lang` (server only). Default: 'id'. */
export async function getLang(): Promise<Lang> {
  try {
    const store = await cookies();
    const v = store.get(LANG_COOKIE)?.value;
    return isLang(v) ? v : 'id';
  } catch {
    return 'id';
  }
}
