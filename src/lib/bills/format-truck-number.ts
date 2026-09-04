/**
 * Display format: first two letters, then the middle block, then the last 4 digits.
 * `KA01AB1234` / `KA 01 AB 1234` → `KA 01AB 1234`.
 */
export function formatTruckNumber(value: string): string {
  const compact = value.replace(/[\s-]+/g, '').toUpperCase();
  if (compact.length < 6) {
    return value.trim();
  }

  const prefix = compact.slice(0, 2);
  const suffix = compact.slice(-4);
  const middle = compact.slice(2, -4);
  return middle ? `${prefix} ${middle} ${suffix}` : `${prefix} ${suffix}`;
}
