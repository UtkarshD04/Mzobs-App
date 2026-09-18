// MZOBS blue design system — matches Website/Landing-Frontend/src/index.css's
// `--explorer-*` tokens (job-discovery site, hero/CTA blue) so the mobile
// app reads as a direct extension of the current MZOBS website, not a
// separate product. `navy` is the app's primary-action color name (buttons,
// links, focus) — historically teal, now the same blue as the website's
// --explorer-blue/--explorer-blue-hover so both surfaces share one accent.
// ink/inkSecondary/border pull the exact --explorer-navy/--explorer-muted/
// --explorer-border hex values (headings, secondary text, card borders);
// teal/inkTertiary fall back to the sitewide --color-teal*/--color-ink-
// tertiary since the explorer palette doesn't define its own.
export const light = {
  bg: '#F7F9FC',
  bgSecondary: '#F1F4F9',
  surface: '#FFFFFF',
  surfaceHover: '#F5F7FB',
  surfaceSunken: '#EEF1F6',

  // ink/inkSecondary = --explorer-navy/--explorer-muted (headings/primary
  // text, secondary text on the home page); inkTertiary has no explorer
  // equivalent so it falls back to sitewide --color-ink-tertiary.
  ink: '#16324f',
  inkSecondary: '#64748b',
  inkTertiary: '#9ca3af',

  border: '#e6eaf0',
  borderStrong: '#DEE4EC',

  navy950: '#0A1E30',
  navy900: '#0F2338',
  navy700: '#1D4ED8',
  navy: '#2563EB',
  navyHover: '#1D4ED8',
  navyTint: '#EFF6FF',
  navyTintStrong: '#bfd3fb',

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

  teal: '#0e8a78',
  tealDot: '#149684',
  tealTint: '#e3f7f3',

  amber: '#c2540c',
  amberDot: '#d5610f',
  amberTint: '#fbeee3',
}

export const dark = {
  bg: '#0A1420',
  bgSecondary: '#0D1826',
  surface: '#122032',
  surfaceHover: '#18283C',
  surfaceSunken: '#152436',

  ink: '#f2f3f5',
  inkSecondary: '#9aa2b1',
  inkTertiary: '#6b7383',

  border: '#232b3d',
  borderStrong: '#2e374c',

  navy950: '#0A1E30',
  navy900: '#0F2338',
  navy700: '#93C5FD',
  navy: '#60A5FA',
  navyHover: '#93C5FD',
  navyTint: 'rgba(96, 165, 250, 0.16)',
  navyTintStrong: 'rgba(96, 165, 250, 0.24)',

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

  teal: '#3fd9c4',
  tealDot: '#3fd9c4',
  tealTint: 'rgba(63, 217, 196, 0.16)',

  amber: '#f0894a',
  amberDot: '#f0894a',
  amberTint: 'rgba(240, 137, 74, 0.16)',
}
