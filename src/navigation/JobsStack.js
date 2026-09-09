import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../theme'
import HamburgerButton from '../components/ui/HamburgerButton'
import JobListScreen from '../screens/jobs/JobListScreen'
import JobDetailScreen from '../screens/jobs/JobDetailScreen'
import JobFiltersScreen from '../screens/jobs/JobFiltersScreen'

const Stack = createNativeStackNavigator()

export default function JobsStack() {
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
        name="JobList"
        component={JobListScreen}
        options={({ navigation }) => ({ title: 'Job Openings', headerLeft: () => <HamburgerButton navigation={navigation} /> })}
      />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
      <Stack.Screen name="JobFilters" component={JobFiltersScreen} options={{ title: 'Filters' }} />
    </Stack.Navigator>
  )
}
