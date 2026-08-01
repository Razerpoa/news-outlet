const rawBrandName =
  process.env.NEXT_PUBLIC_SITE_BRAND_NAME?.trim() ||
  process.env.SITE_BRAND_NAME?.trim() ||
  'DreksZone';

export const SITE_BRAND_NAME = rawBrandName.replace(/\s+/g, ' ').trim() || 'DreksZone';

export function getBrandParts(name = SITE_BRAND_NAME) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts.shift() ?? name;
  const rest = parts.join(' ');

  return {
    first,
    rest,
  };
}
