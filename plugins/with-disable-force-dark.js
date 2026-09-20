const { withAndroidStyles } = require('@expo/config-plugins');

/**
 * Android DayNight can invert RN views (bill memo paper). Compose already
 * follows Host colorScheme, so force-dark is only harmful.
 */
function withDisableForceDark(config) {
  return withAndroidStyles(config, (mod) => {
    const styles = mod.modResults.resources.style;
    if (!styles) {
      return mod;
    }

    const appTheme = styles.find((style) => style.$?.name === 'AppTheme');
    if (!appTheme) {
      return mod;
    }

    const items = appTheme.item ?? [];
    const existing = items.find((item) => item.$?.name === 'android:forceDarkAllowed');
    if (existing) {
      existing._ = 'false';
    } else {
      items.push({ $: { name: 'android:forceDarkAllowed' }, _: 'false' });
    }
    appTheme.item = items;
    return mod;
  });
}

module.exports = withDisableForceDark;
