import { Pressable, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { openDrawer } from '../lib/navigation'
import HomeStack from './HomeStack'
import JobsStack from './JobsStack'
import ApplicationsScreen from '../screens/ApplicationsScreen'
import ResumeScreen from '../screens/ResumeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import HamburgerButton from '../components/ui/HamburgerButton'

const Tab = createBottomTabNavigator()

const ICONS = {
  Home: 'home',
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
  const { colors, fontFamily } = useTheme()
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 8)

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
        tabBarLabelStyle: { fontFamily: fontFamily.semibold, fontSize: 10.5, marginTop: 2 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 56 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <View
            style={{
              width: 40,
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
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={({ navigation }) => ({ headerRight: () => <NotificationsBell navigation={navigation} color={colors.ink} /> })}
      />
      <Tab.Screen
        name="Resume"
        component={ResumeScreen}
        options={({ navigation }) => ({ headerRight: () => <NotificationsBell navigation={navigation} color={colors.ink} /> })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({ headerRight: () => <NotificationsBell navigation={navigation} color={colors.ink} /> })}
      />
    </Tab.Navigator>
  )
}
