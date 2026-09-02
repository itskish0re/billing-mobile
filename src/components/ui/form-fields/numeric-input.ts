export const DEFAULT_MAX_INTEGER_DIGITS = 8;

/**
 * Parses decimal input, returning:
 *  - `''` for an empty field,
 *  - `null` for an invalid/rejected keystroke (caller should ignore it),
 *  - a finite `number` otherwise.
 */
export function parseNumericInput(
  raw: string,
  maxIntegerDigits = DEFAULT_MAX_INTEGER_DIGITS
): number | '' | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return '';
  }

  if (!/^-?\d*(\.\d*)?$/.test(trimmed) || trimmed === '-' || trimmed === '.') {
    return null;
  }

  const integerPart = trimmed.split('.')[0]?.replace(/^-/, '') ?? '';
  if (integerPart.length > maxIntegerDigits) {
    return null;
  }

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
