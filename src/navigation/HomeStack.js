import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../theme'
import HamburgerButton from '../components/ui/HamburgerButton'
import HomeScreen from '../screens/HomeScreen'
import JobDetailScreen from '../screens/jobs/JobDetailScreen'

const Stack = createNativeStackNavigator()

export default function HomeStack() {
  const { colors } = useTheme()
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeFeed"
        component={HomeScreen}
        options={({ navigation }) => ({ title: 'Home', headerLeft: () => <HamburgerButton navigation={navigation} /> })}
      />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
    </Stack.Navigator>
  )
}
