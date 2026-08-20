import { View } from 'react-native'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../theme'
import AuthStack from './AuthStack'
import AppDrawer from './AppDrawer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

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
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <LoadingSpinner />
      </View>
    )

  return <NavigationContainer theme={navTheme}>{isAuthenticated ? <AppDrawer /> : <AuthStack />}</NavigationContainer>
}
