/**
 * Display format: first 4 characters, middle block, last 4 digits.
 * `KA01AB1234` / `KA 01 AB 1234` → `KA01 AB 1234`.
 */
export function formatTruckNumber(value: string): string {
  const compact = value.replace(/[\s-]+/g, '').toUpperCase();
  if (compact.length < 8) {
    return compact || value.trim().toUpperCase();
  }

  const prefix = compact.slice(0, 4);
  const suffix = compact.slice(-4);
  const middle = compact.slice(4, -4);
  return middle ? `${prefix} ${middle} ${suffix}` : `${prefix} ${suffix}`;
}
