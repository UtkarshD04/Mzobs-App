import { useEffect, useState } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import * as SecureStore from 'expo-secure-store'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../theme'
import AuthStack from './AuthStack'
import AppDrawer from './AppDrawer'
import { navigationRef } from '../lib/navigation'
import PushListeners from '../components/notifications/PushListeners'
import NotificationPermissionPrompt from '../components/notifications/NotificationPermissionPrompt'
import ProfileSetupScreen from '../screens/ProfileSetupScreen'
import { useProfileQuery } from '../hooks/useProfile'

// Once the one-time fee is paid the backend raises profile.profileSetupPending until the
// full profile is submitted; until then this replaces the whole app with the wizard.
// "Skip for now" is remembered per account on this device, so it doesn't nag on every launch;
// the profile can still be completed anytime from the Profile tab.
const skipKey = (profile) => `mzobs-profile-setup-skipped-${String(profile.id ?? profile.email).replace(/[^A-Za-z0-9._-]/g, '_')}`

function SignedInApp() {
  const { data: profile, isLoading } = useProfileQuery()
  const { colors } = useTheme()
  const [skipped, setSkipped] = useState(null) // null = not read from storage yet
  const setupPending = !!profile?.profileSetupPending

  useEffect(() => {
    if (!setupPending) return
    SecureStore.getItemAsync(skipKey(profile))
      .then((v) => setSkipped(v === '1'))
      .catch(() => setSkipped(false))
  }, [setupPending])

  function skipSetup() {
    setSkipped(true)
    SecureStore.setItemAsync(skipKey(profile), '1').catch(() => {})
  }

  const waiting = isLoading || (setupPending && skipped === null)
  // Hand over from the native splash once the signed-in app has real content.
  useEffect(() => {
    if (!waiting) SplashScreen.hideAsync().catch(() => {})
  }, [waiting])

  if (waiting) return <View style={{ flex: 1, backgroundColor: colors.bg }} />
  if (setupPending && !skipped) return <ProfileSetupScreen onSkip={skipSetup} />
  return (
    <>
      <AppDrawer />
      <PushListeners />
      <NotificationPermissionPrompt />
    </>
  )
}

export default function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const { colors, isDark } = useTheme()

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.surface,
      border: colors.border,
      text: colors.ink,
      primary: colors.navy,
    },
  }

  // Signed out: nothing more to wait for once the stored token has been checked.
  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) SplashScreen.hideAsync().catch(() => {})
  }, [isBootstrapping, isAuthenticated])

  // The native splash (logo) is still up while the stored token is checked.
  if (isBootstrapping) return null

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      {isAuthenticated ? (
        <SignedInApp />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  )
}
