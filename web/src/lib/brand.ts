const rawBrandName =
  process.env.NEXT_PUBLIC_SITE_BRAND_NAME?.trim() ||
  process.env.SITE_BRAND_NAME?.trim() ||
  'DreksZone';

export const SITE_BRAND_NAME = rawBrandName.replace(/\s+/g, ' ').trim() || 'DreksZone';

export function getBrandParts(name = SITE_BRAND_NAME) {
  const normalized = name.trim().replace(/\s+/g, ' ');
  const uppercaseIndexes = Array.from(normalized.matchAll(/[A-Z]/g), (match) => match.index ?? -1);
  const secondCapitalIndex = uppercaseIndexes[1];

  if (typeof secondCapitalIndex === 'number') {
    const first = normalized.slice(0, secondCapitalIndex);
    const rest = normalized.slice(secondCapitalIndex);

    return {
      first,
      rest,
    };
  }

  return {
    first: normalized,
    rest: '',
  };
}
