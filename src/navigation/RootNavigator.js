import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../theme'
import AuthStack from './AuthStack'
import AppDrawer from './AppDrawer'
import BrandLogo from '../components/ui/BrandLogo'
import { navigationRef } from '../lib/navigation'
import PushListeners from '../components/notifications/PushListeners'
import NotificationPermissionPrompt from '../components/notifications/NotificationPermissionPrompt'
import ProfileSetupScreen from '../screens/ProfileSetupScreen'
import { useProfileQuery } from '../hooks/useProfile'

// Once the one-time fee is paid the backend raises profile.profileSetupPending until the
// full profile is submitted; until then this replaces the whole app with the wizard.
function SignedInApp() {
  const { data: profile, isLoading } = useProfileQuery()
  const { colors } = useTheme()
  if (isLoading)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="small" color={colors.navy} />
      </View>
    )
  if (profile?.profileSetupPending) return <ProfileSetupScreen />
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

  if (isBootstrapping)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, gap: 20 }}>
        <BrandLogo height={30} />
        <ActivityIndicator size="small" color={colors.navy} />
      </View>
    )

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
