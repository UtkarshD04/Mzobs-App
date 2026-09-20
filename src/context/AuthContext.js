import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { tokenStore, setUnauthorizedHandler } from '../lib/api'
import * as authService from '../services/authService'
import * as pushService from '../services/pushService'
import { registerForPushNotificationsAsync } from '../lib/pushNotifications'
import { setSavedJobsOwner } from '../lib/savedJobs'

// Fire-and-forget: a denied permission or offline device shouldn't block
// login/signup/bootstrap, so failures here are swallowed.
async function registerPushToken() {
  try {
    const token = await registerForPushNotificationsAsync()
    if (token) await pushService.registerExpoToken(token)
  } catch {
    // ignore — push registration is best-effort
  }
}

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
      let stored
      try {
        stored = await tokenStore.get()
      } catch {
        // stored token unreadable — treat as logged out
      }
      if (!stored) {
        setIsBootstrapping(false)
        return
      }
      try {
        const me = await authService.getMe()
        setToken(stored)
        setEmployee(me)
        registerPushToken()
      } catch {
        // 401 interceptor already clears the stored token on auth failure.
      } finally {
        setIsBootstrapping(false)
      }
    })()
  }, [])

  // Finishes a login/signup PhoneAuthScreen already ran itself (via
  // authService.phoneLogin/signup/googleSignup/googleLogin, called directly
  // so it can persist the token — tokenStore.set, not this — before this
  // runs, letting its resume-upload step authenticate requests while still
  // showing the pre-Home "upload your resume" screen). This flips
  // isAuthenticated so RootNavigator swaps to the app tree.
  const completeSession = useCallback((newToken, summary) => {
    setToken(newToken)
    setEmployee(summary)
    registerPushToken()
  }, [])

  // Scope the saved-jobs list to whoever is signed in.
  useEffect(() => {
    setSavedJobsOwner(token ? (employee?.id ?? employee?._id ?? 'me') : null)
  }, [token, employee])

  const value = {
    token,
    employee,
    isAuthenticated: !!token,
    isBootstrapping,
    completeSession,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
