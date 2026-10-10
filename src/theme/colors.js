// MZOBS DESIGN SYSTEM — teal. Matches Website/Landing-Frontend/src/index.css
// (the `--color-mz-*` v2 token block plus the `.mz-home` palette override,
// search `mz-home` in that file) so the app reads as the same product as the
// candidate website, which was re-themed from indigo to teal.
//
// Key mapping, light theme:
//   bg/ink/inkSecondary/inkTertiary/border/borderStrong -> .mz-home's
//     --color-mz-bg / --color-mz-ink / --color-mz-ink-2 / --color-mz-muted /
//     --color-mz-line / --color-mz-line-strong (the home page is the site's
//     reference screen). surface is white; surfaceHover/surfaceSunken/
//     bgSecondary are derived tints of the same family.
//   navy/navyHover/navyTint -> --color-mz-primary / --color-mz-primary-strong /
//     --color-mz-primary-tint. "navy" is kept as the key name (historically
//     this app's primary-action color) but now carries the mz teal.
//     navy900/navy950 are deep teal shades for cards that stay dark in both
//     themes (e.g. the subscription plan card).
//   secondary -> --color-mz-secondary; primaryRing -> --color-mz-primary-ring
//   teal* -> --color-mz-accent-ink / --color-mz-accent / --color-mz-accent-tint
//   gold/green/red/gray/violet/amber -> unchanged sitewide status tokens.
//
// Dark theme: the site has no distinct dark mode for the mz block, so the
// teal family is lightened for contrast on dark surfaces and tints become
// low-alpha overlays; neutrals come from the sitewide light-dark() dark side.
export const light = {
  bg: '#f7f9fc',
  bgSecondary: '#eff3f7',
  surface: '#ffffff',
  surfaceHover: '#f3f7f8',
  surfaceSunken: '#edf2f5',

  // ink/inkSecondary/inkTertiary = --color-mz-ink / --color-mz-ink-2 /
  // --color-mz-muted.
  ink: '#16324f',
  inkSecondary: '#2c4560',
  inkTertiary: '#66768a',

  border: '#e6eaf0',
  borderStrong: '#d3dae3',

  navy950: '#06322e',
  navy900: '#075f55',
  navy700: '#075f55',
  navy: '#0b7a6d',
  navyHover: '#075f55',
  navyTint: '#e7f5f1',
  navyTintStrong: '#cfece5',

  secondary: '#0f8b7d',
  primaryRing: 'rgba(11, 122, 109, 0.28)',

  gold: '#c68a1f',
  goldStrong: '#9a6b14',
  goldDot: '#e3a62f',
  goldTint: '#fbf3de',

  green: '#15803d',
  greenDot: '#22a55a',
  greenTint: '#eaf7ef',

  red: '#b42318',
  redDot: '#e5484d',
  redTint: '#fdf0ee',

  grayTint: '#f3f4f6',
  grayDot: '#9ca3af',

  violet: '#6d4fc7',
  violetDot: '#7c5fd6',
  violetTint: '#f1eefc',

  // teal/tealDot/tealTint = --color-mz-accent-ink (text-safe on white) /
  // --color-mz-accent (bright teal-green, dots/badges) / --color-mz-accent-tint.
  teal: '#0b8a67',
  tealDot: '#20c997',
  tealTint: '#e4f8f1',

  amber: '#c2540c',
  amberDot: '#d5610f',
  amberTint: '#fbeee3',
}

export const dark = {
  bg: '#0a0e17',
  bgSecondary: '#0d111c',
  surface: '#121826',
  surfaceHover: '#19212f',
  surfaceSunken: '#161d2b',

  ink: '#f2f3f5',
  inkSecondary: '#9aa2b1',
  inkTertiary: '#6b7383',

  border: '#232b3d',
  borderStrong: '#2e374c',

  navy950: '#06322e',
  navy900: '#0a4a42',
  navy700: '#8fe3d4',
  navy: '#3cc4b0',
  navyHover: '#5fd8c5',
  navyTint: 'rgba(60, 196, 176, 0.16)',
  navyTintStrong: 'rgba(60, 196, 176, 0.26)',

  secondary: '#4fd0bd',
  primaryRing: 'rgba(60, 196, 176, 0.32)',

  gold: '#e3ac3d',
  goldStrong: '#f0c267',
  goldDot: '#e3ac3d',
  goldTint: 'rgba(227, 172, 61, 0.14)',

  green: '#3fbe77',
  greenDot: '#3fbe77',
  greenTint: 'rgba(63, 190, 119, 0.14)',

  red: '#f0645f',
  redDot: '#f0645f',
  redTint: 'rgba(240, 100, 95, 0.14)',

  grayTint: 'rgba(154, 162, 177, 0.12)',
  grayDot: '#7a8194',

  violet: '#a594ff',
  violetDot: '#a594ff',
  violetTint: 'rgba(165, 148, 255, 0.16)',

  teal: '#3ddda1',
  tealDot: '#3ddda1',
  tealTint: 'rgba(61, 221, 161, 0.16)',

  amber: '#f0894a',
  amberDot: '#f0894a',
  amberTint: 'rgba(240, 137, 74, 0.16)',
}
