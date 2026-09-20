import { useCallback, useEffect, useState } from 'react'
import { AppState, Linking } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { PUSH_SUPPORTED, getNotificationPermission, requestNotificationPermission, syncPushToken } from '../lib/pushNotifications'

// Where the phone's notification permission stands, kept fresh: re-read whenever
// the app comes back to the foreground (so turning it on in phone Settings shows
// up immediately), and the push token is registered the moment it's granted.
//
//   status   'unknown' (still checking) | 'granted' | 'denied' | 'undetermined' | 'unsupported'
//   blocked  denied and the OS will no longer show its prompt -> only phone Settings can turn it on
//   enable() asks (OS prompt) when it still can, otherwise opens phone Settings
export function useNotificationPermission() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: PUSH_SUPPORTED ? 'unknown' : 'unsupported', canAskAgain: true })

  const refresh = useCallback(async () => {
    try {
      const next = await getNotificationPermission()
      setState(next)
      if (next.status === 'granted' && isAuthenticated) syncPushToken()
      return next
    } catch {
      return null
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
    const sub = AppState.addEventListener('change', (appState) => appState === 'active' && refresh())
    return () => sub.remove()
  }, [refresh])

  const enable = useCallback(async () => {
    if (!PUSH_SUPPORTED) return null
    const current = await getNotificationPermission()
    if (current.status === 'granted') return refresh()
    if (current.canAskAgain) {
      await requestNotificationPermission()
      return refresh()
    }
    await Linking.openSettings()
    return null
  }, [refresh])

  return {
    ...state,
    supported: PUSH_SUPPORTED,
    enabled: state.status === 'granted',
    blocked: state.status === 'denied' && !state.canAskAgain,
    refresh,
    enable,
  }
}
