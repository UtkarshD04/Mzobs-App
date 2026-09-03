import { Pressable, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { openDrawer } from '../lib/navigation'
import HomeStack from './HomeStack'
import DashboardScreen from '../screens/DashboardScreen'
import JobsStack from './JobsStack'
import ApplicationsScreen from '../screens/ApplicationsScreen'
import ResumeScreen from '../screens/ResumeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import HamburgerButton from '../components/ui/HamburgerButton'

const Tab = createBottomTabNavigator()

const ICONS = {
  Home: 'home',
  Dashboard: 'grid',
  Jobs: 'briefcase',
  Applications: 'clipboard',
  Resume: 'file-text',
  Profile: 'user',
}

function NotificationsBell({ navigation, color }) {
  return (
    <Pressable onPress={() => navigation.navigate('Notifications')} style={{ marginRight: 16 }} hitSlop={8}>
      <Feather name="bell" size={20} color={color} />
    </Pressable>
  )
}

export default function AppTabs() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route, navigation }) => ({
        headerShown: route.name !== 'Home' && route.name !== 'Jobs',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        headerLeft: () => <HamburgerButton navigation={navigation} />,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.inkTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingTop: 6 },
        tabBarIcon: ({ color, focused, size }) => (
          <View
            style={{
              width: 36,
              height: 26,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? colors.navyTint : 'transparent',
            }}
          >
            <Feather name={ICONS[route.name]} color={color} size={size - 2} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({ headerRight: () => <NotificationsBell navigation={navigation} color={colors.ink} /> })}
      />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Resume" component={ResumeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
