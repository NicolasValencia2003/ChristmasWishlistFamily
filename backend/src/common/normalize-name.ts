/** Trims and collapses repeated whitespace, keeping the original casing and accents. */
export function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Normalized key used to match people: lowercase, trimmed, repeated spaces
 * collapsed and diacritics removed. "María", "maria" and " MARIA " → "maria".
 */
export function normalizeName(value: string): string {
  return cleanName(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
