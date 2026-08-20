import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '../theme'
import DrawerContent from './DrawerContent'
import AppTabs from './AppTabs'
import MockInterviewScreen from '../screens/MockInterviewScreen'
import InterviewCenterScreen from '../screens/InterviewCenterScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import MessagesScreen from '../screens/MessagesScreen'
import SubscriptionScreen from '../screens/SubscriptionScreen'
import SettingsScreen from '../screens/SettingsScreen'
import SupportScreen from '../screens/SupportScreen'

const Drawer = createDrawerNavigator()

export default function AppDrawer() {
  const { colors } = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: colors.bg, width: 280 },
      }}
    >
      <Drawer.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="MockInterview" component={MockInterviewScreen} options={{ title: 'Mock Interview' }} />
      <Drawer.Screen name="InterviewCenter" component={InterviewCenterScreen} options={{ title: 'Interview Center' }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Drawer.Screen name="Messages" component={MessagesScreen} options={{ title: 'Placement Desk' }} />
      <Drawer.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscription' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
    </Drawer.Navigator>
  )
}
