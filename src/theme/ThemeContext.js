import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { light, dark } from './colors'

// Matches Website/Landing-Frontend's --radius-* tokens exactly (sm/md/lg/xl).
export const radius = { sm: 8, md: 12, lg: 16, xl: 20 }

export const spacing = { xs: 4, sm: 8, md: 12, lg: 18, xl: 26, xxl: 34 }

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
}

const THEME_KEY = 'mzobs-theme-mode'
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_KEY)
        if (stored === 'dark' || stored === 'light') setModeState(stored)
      } catch {
        // ignore — fall back to default theme
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const setMode = useCallback((next) => {
    setModeState(next)
    SecureStore.setItemAsync(THEME_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      SecureStore.setItemAsync(THEME_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? dark : light,
      radius,
      spacing,
      fontFamily,
      setMode,
      toggleTheme,
      ready,
    }),
    [mode, ready, setMode, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
