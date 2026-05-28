/**
 * Design tokens — mirrors the CSS custom properties in mockup-warm.html.
 * Source of truth for color, spacing, type. Any value used in a screen
 * should come from here, not be inlined.
 */

export const palette = {
  cream: '#F8F1E4', // page surface
  creamSoft: '#FDF8EE', // card surface
  creamWarmer: '#F0E6D2', // slight depth
  ink: '#2B2418', // primary text — deep warm brown
  inkSoft: '#5C5141', // secondary text
  inkFaint: '#948672', // tertiary text
  line: 'rgba(43, 36, 24, 0.08)',
  coral: '#D97757', // warm accent (action)
  coralSoft: '#F5D9C9',
  sage: '#6B8E6B',
  sageSoft: '#D8E4D2',
  peach: '#F2C9A0',
  gold: '#E0B454',
  goldSoft: '#FCEFC9', // pale yellow — stage badge pill, soft warm fills
  white: '#FFFFFF',
} as const;

/**
 * Splash backdrop — mockup-warm.html uses `filter: blur(28px)` on a
 * container holding 4 colored corner tiles, smearing them across a
 * cream base to produce the dreamy warm-fog feel.
 *
 * In RN we recreate this with two layers (see `app/index.tsx`):
 *
 *   1. `splashBase`   — full-screen LinearGradient mirroring the
 *      mockup's --gradient-aby. Always-present warm wash.
 *
 *   2. `splashGlow.*` — four corner Ellipses inside a single SVG
 *      with `<FeGaussianBlur stdDeviation>`. The blur is the real
 *      Gaussian convolution from SVG filter primitives (same algo
 *      as CSS `filter: blur()` in the mockup). Each tile contributes
 *      its single saturated color; the blur does the soft fading.
 *
 *   Why one color per tile? After Gaussian blur of stdDeviation 14+,
 *   gradients-inside-tiles smear past visibility. A single mid-tone
 *   color renders identically and keeps the SVG markup short.
 *
 *   stdDeviation = 14 ≈ CSS blur(28px) — CSS blur radius is roughly
 *   2× the SVG stdDeviation. Tunable in tokens via `splashBlurStd`.
 */
export const splashBase = {
  colors: ['#FFE2C5', '#F8E5D3', '#E7DBE9', '#C7DBEA'] as const,
  locations: [0, 0.35, 0.7, 1] as const,
};

export const splashGlow = {
  topLeft: { color: '#F2A57A' },
  topRight: { color: '#A8C0A4' },
  bottomLeft: { color: '#C9B6CC' },
  bottomRight: { color: '#F2C9A0' },
} as const;

/** Tunable. 14 ≈ CSS blur(28px). Bump to 20–30 if mockup looks softer. */
export const splashBlurStd = 14;
/** Mockup's .splash-bg opacity + transform: scale(1.15). */
export const splashFogOpacity = 0.7;
export const splashFogScale = 1.15;

/**
 * Static Pretendard variants. Variable-font + RN `fontWeight` was
 * unreliable on iOS (rendered SemiBold no matter the weight), so we
 * use one .otf file per weight and reference it explicitly. Never
 * set `fontWeight` numerically on a Text — pick the right family.
 */
export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

/**
 * Type scale matching mockup-warm.html. Max size capped at 24 per design
 * decision in this project's session history.
 *
 * Every entry pairs fontFamily + fontSize + lineHeight. Use:
 *   ...type.headline      // spread into a StyleSheet entry
 *   type.tagline.fontFamily
 * Never combine `type.X` with an inline `fontWeight`.
 */
export const type = {
  display: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  headline: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30 },
  tagline: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  question: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 30 },
  title: { fontFamily: fonts.medium, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  pillLabel: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  chipLabel: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  fieldLabel: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
  fieldValue: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24 },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  legal: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.3,
  },
  wordmark: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2.5,
  },
} as const;

export const radius = {
  chip: 18,
  field: 14,
  card: 18,
  pill: 26, // half of 52px pill button height
  circle: 999,
} as const;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;
