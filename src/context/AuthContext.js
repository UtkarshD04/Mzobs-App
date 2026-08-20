import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { tokenStore, setUnauthorizedHandler } from '../lib/api'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const logout = useCallback(async () => {
    await tokenStore.clear()
    setToken(null)
    setEmployee(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    ;(async () => {
      const stored = await tokenStore.get()
      if (!stored) {
        setIsBootstrapping(false)
        return
      }
      try {
        const me = await authService.getMe()
        setToken(stored)
        setEmployee(me)
      } catch {
        // 401 interceptor already clears the stored token on auth failure.
      } finally {
        setIsBootstrapping(false)
      }
    })()
  }, [])

  const login = useCallback(async (email, password) => {
    const { token: newToken, employee: summary } = await authService.login(email, password)
    await tokenStore.set(newToken)
    setToken(newToken)
    setEmployee(summary)
  }, [])

  const signup = useCallback(async (input) => {
    const { token: newToken, employee: summary } = await authService.signup(input)
    await tokenStore.set(newToken)
    setToken(newToken)
    setEmployee(summary)
  }, [])

  const value = {
    token,
    employee,
    isAuthenticated: !!token,
    isBootstrapping,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
