export const BRAND_SEED_COLOR = '#9A6B43';

/** Static chrome colors aligned with M3 secondaryContainer for the brand seed. */
export const TabChrome = {
  light: {
    headerBackground: '#F3E8DC',
    onHeader: '#2A1707',
    onHeaderMuted: '#5C4A3A',
    contentBackground: '#FFFBFE',
    divider: '#D8C4B4',
    statusBar: '#F3E8DC',
  },
  dark: {
    headerBackground: '#3E2F24',
    onHeader: '#F3E8DC',
    onHeaderMuted: '#C9B8A8',
    contentBackground: '#1C1B1F',
    divider: '#5C4A3A',
    statusBar: '#3E2F24',
  },
} as const;

export type ColorSchemeName = keyof typeof TabChrome;

export function resolveColorScheme(scheme: string | null | undefined): ColorSchemeName {
  return scheme === 'dark' ? 'dark' : 'light';
}
