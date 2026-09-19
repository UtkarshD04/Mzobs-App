import { createNativeStackNavigator } from '@react-navigation/native-stack'
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen'

const Stack = createNativeStackNavigator()

// A single phone-first screen handles both login and signup (see
// PhoneAuthScreen.js) — "Login" and "Signup" both point at it so any
// existing navigation.navigate('Login'/'Signup') call elsewhere still works.
export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={PhoneAuthScreen} />
      <Stack.Screen name="Signup" component={PhoneAuthScreen} />
    </Stack.Navigator>
  )
}
