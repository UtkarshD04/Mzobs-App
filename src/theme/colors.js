// MZOBS DESIGN SYSTEM v2 — matches Website/Landing-Frontend/src/index.css's
// "MZOBS DESIGN SYSTEM v2" token block (search `--color-mz-primary` in that
// file) so the mobile app reads as the same product as the current
// candidate website. This replaces the older "explorer" navy/blue palette
// this file used to describe (that website design has since been
// superseded by the indigo/violet v2 system below).
//
// Key mapping, light theme:
//   bg/bgSecondary/surface/surfaceHover/surfaceSunken -> --color-mz-bg /
//     --color-mz-surface (site has no separate bgSecondary/surfaceHover/
//     surfaceSunken tokens for v2, so those are derived tints of the same
//     indigo-neutral family for the app's extra surface states)
//   ink/inkSecondary/inkTertiary -> --color-mz-ink / --color-mz-ink-2 /
//     --color-mz-muted
//   border/borderStrong -> --color-mz-line / --color-mz-line-strong
//   navy/navyHover/navyTint/navyTintStrong -> --color-mz-primary /
//     --color-mz-primary-strong / --color-mz-primary-tint / a stronger tint
//     derived from it ("navy" is kept as the key name — historically this
//     app's primary-action color — but it now carries the mz indigo, not a
//     literal navy hue). navy900/navy950 are deeper indigo shades with no
//     direct v2 token, used for rich dark-surface cards (e.g. the
//     subscription plan card) that stay dark regardless of theme.
//   secondary -> --color-mz-secondary
//   primaryRing -> --color-mz-primary-ring
//   teal/tealDot/tealTint -> --color-mz-accent-ink / --color-mz-accent /
//     --color-mz-accent-tint ("teal" is kept as the key name for the
//     success/verified/highlight accent; it now carries the mz teal-green,
//     not the old literal teal)
//   gold/green/red/gray/violet/amber families -> unchanged. These already
//   match the CURRENT sitewide light-dark() status tokens further up
//   index.css (--color-gold*, --color-green*, --color-red*, --color-violet*,
//   --color-amber*) exactly, in both light and dark, so no update needed —
//   the v2 block doesn't redefine status semantics.
//
// Dark theme: the v2 tokens above are fixed light-only values (no
// light-dark() wrapping in index.css for that block — the website itself
// has no distinct dark mode for this design). bg/surface/ink/border/status
// colors are taken from the sitewide light-dark() dark-side values earlier
// in index.css (--color-bg, --color-surface, --color-ink, --color-border,
// --color-green/red/gold/violet/amber). The indigo primary/secondary/accent
// family has no dark-side site token, so it's derived here the same way the
// old dark palette lightened its light-mode blue for contrast on a dark
// background (dark values sit lighter/brighter than their light
// counterparts, tints become low-alpha overlays instead of flat pastels).
export const light = {
  bg: '#f7f8fc',
  bgSecondary: '#f0f1f8',
  surface: '#ffffff',
  surfaceHover: '#f5f5fc',
  surfaceSunken: '#eceefa',

  // ink/inkSecondary/inkTertiary = --color-mz-ink / --color-mz-ink-2 /
  // --color-mz-muted.
  ink: '#111827',
  inkSecondary: '#344054',
  inkTertiary: '#667085',

  border: '#e6e8f0',
  borderStrong: '#d5d8e4',

  navy950: '#15173d',
  navy900: '#1e2170',
  navy700: '#4a4ed8',
  navy: '#5b5fef',
  navyHover: '#4a4ed8',
  navyTint: '#eeefff',
  navyTintStrong: '#dcddff',

  secondary: '#7c6cff',
  primaryRing: 'rgba(91, 95, 239, 0.28)',

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

  navy950: '#181a4a',
  navy900: '#242868',
  navy700: '#aeb1ff',
  navy: '#8b8ff5',
  navyHover: '#a5a8ff',
  navyTint: 'rgba(139, 143, 245, 0.16)',
  navyTintStrong: 'rgba(139, 143, 245, 0.24)',

  secondary: '#a79cff',
  primaryRing: 'rgba(139, 143, 245, 0.32)',

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
