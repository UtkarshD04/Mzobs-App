import { createNativeStackNavigator } from '@react-navigation/native-stack'
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen'
import { PrivacyPolicyScreen, TermsAndConditionsScreen } from '../screens/LegalScreens'
import { useTheme } from '../theme'

const Stack = createNativeStackNavigator()

// A single phone-first screen handles both login and signup (see
// PhoneAuthScreen.js) — "Login" and "Signup" both point at it so any
// existing navigation.navigate('Login'/'Signup') call elsewhere still works.
export default function AuthStack() {
  const { colors } = useTheme()
  const legalOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.ink,
    headerShadowVisible: false,
    headerBackTitle: 'Back',
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={PhoneAuthScreen} />
      <Stack.Screen name="Signup" component={PhoneAuthScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ ...legalOptions, title: 'Privacy Policy' }} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ ...legalOptions, title: 'Terms & Conditions' }} />
    </Stack.Navigator>
  )
}
