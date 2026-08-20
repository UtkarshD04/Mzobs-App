// Ported 1:1 from Website/Frontend/src/index.css's `@theme` token block
// (each light-dark() pair becomes light/dark here) so the mobile app reads
// as the same product as the web dashboard.
export const light = {
  bg: '#ffffff',
  bgSecondary: '#fafafa',
  surface: '#ffffff',
  surfaceHover: '#f5f6f8',
  surfaceSunken: '#f3f4f6',

  ink: '#111827',
  inkSecondary: '#6b7280',
  inkTertiary: '#9ca3af',

  border: '#e5e7eb',
  borderStrong: '#d9dce3',

  navy950: '#0c130e',
  navy900: '#142016',
  navy700: '#4a6f3f',
  navy: '#3d5c34',
  navyHover: '#314a2a',
  navyTint: '#eef3ec',
  navyTintStrong: '#e1ebdd',

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

  navy950: '#0c130e',
  navy900: '#142016',
  navy700: '#8fbd7d',
  navy: '#6e9d5c',
  navyHover: '#7eae6c',
  navyTint: 'rgba(110, 157, 92, 0.14)',
  navyTintStrong: 'rgba(110, 157, 92, 0.22)',

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
