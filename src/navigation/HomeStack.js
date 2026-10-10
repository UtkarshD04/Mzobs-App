import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../theme'
import HomeScreen from '../screens/HomeScreen'
import JobDetailScreen from '../screens/jobs/JobDetailScreen'

const Stack = createNativeStackNavigator()

export default function HomeStack() {
  const { colors, fontFamily } = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.ink },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
    </Stack.Navigator>
  )
}
