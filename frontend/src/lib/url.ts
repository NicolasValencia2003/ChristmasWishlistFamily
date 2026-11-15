/**
 * Turns whatever the user pasted into a clean link:
 * - "Mira este producto en Amazon https://a.co/d/abc" → "https://a.co/d/abc" (phone share text)
 * - "tienda.com/producto" → "https://tienda.com/producto"
 */
export function withProtocol(value: string): string {
  const v = value.trim();
  const found = v.match(/https?:\/\/[^\s<>"'«»]+/i);
  if (found) return found[0].replace(/[.,;:!?)\]]+$/, '');
  if (!v || /\s/.test(v) || /^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return `https://${v}`;
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}
