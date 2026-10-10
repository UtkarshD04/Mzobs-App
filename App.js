import { StatusBar } from 'expo-status-bar'
import { LogBox } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { queryClient } from './src/lib/queryClient'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider, useTheme } from './src/theme'
import RootNavigator from './src/navigation/RootNavigator'
import UpdateGate from './src/components/UpdateGate'

// Keep the native splash (the logo) on screen until the app is ready — fonts,
// theme and the signed-in check — instead of showing extra in-app loading
// screens after it. RootNavigator / SignedInApp hide it once there is
// something real to show; the timer below is a safety net so a stuck request
// can never leave the splash up forever.
SplashScreen.preventAutoHideAsync().catch(() => {})
setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 10000)

// Expo Go on Android has no remote-push capability since SDK 53 — expo-notifications
// logs this on import to warn about it. registerPushToken() in AuthContext already
// swallows the resulting failure, so this is a known no-op in Expo Go, not a bug.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  // @msg91comm/sendotp-react-native bundles an unrelated native biometric-auth
  // module that isn't linked in Expo Go (third-party native modules never are —
  // only in a custom dev client). It logs this at import time regardless of
  // whether biometrics are used; our OTP flow (sendOTP/verifyOTP/retryOTP)
  // never touches that bridge, so it's just noise, not a real failure.
  'BiometricAuth is undefined',
])

// Show notifications while the app is open, not just when backgrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

function AppContent({ fontsLoaded }) {
  const { isDark, ready } = useTheme()

  // Native splash is still showing — nothing to render yet.
  if (!fontsLoaded || !ready) return null

  return (
    <UpdateGate>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </AuthProvider>
      </QueryClientProvider>
    </UpdateGate>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent fontsLoaded={fontsLoaded} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
