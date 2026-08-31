import { StatusBar } from 'expo-status-bar'
import { View, LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { queryClient } from './src/lib/queryClient'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider, useTheme } from './src/theme'
import RootNavigator from './src/navigation/RootNavigator'

// Expo Go on Android has no remote-push capability since SDK 53 — expo-notifications
// logs this on import to warn about it. registerPushToken() in AuthContext already
// swallows the resulting failure, so this is a known no-op in Expo Go, not a bug.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications'])

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
  const { colors, isDark, ready } = useTheme()

  if (!fontsLoaded || !ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </AuthProvider>
    </QueryClientProvider>
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
