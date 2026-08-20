import { light } from './colors'

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 }

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 }

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
}

// Mirrors the web's default: `AppContext` starts `themeOverride` at 'light'
// and only moves to dark on an explicit user toggle (persisted) — it does
// not follow the OS preference out of the box. There's no theme toggle in
// the app yet (that's a Settings-screen feature for a later phase), so this
// is hard-pinned to light for now; swap in the `dark` palette here once that
// toggle exists.
export function useTheme() {
  return { colors: light, radius, spacing, fontFamily, isDark: false }
}
