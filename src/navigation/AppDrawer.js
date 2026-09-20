import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '../theme'
import DrawerContent from './DrawerContent'
import AppTabs from './AppTabs'
import NotificationsScreen from '../screens/NotificationsScreen'
import SavedJobsScreen from '../screens/SavedJobsScreen'
import SubscriptionScreen from '../screens/SubscriptionScreen'
import SettingsScreen from '../screens/SettingsScreen'
import SupportScreen from '../screens/SupportScreen'
import { PrivacyPolicyScreen, TermsAndConditionsScreen } from '../screens/LegalScreens'

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
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Drawer.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs' }} />
      <Drawer.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'Subscription' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Drawer.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Terms & Conditions' }} />
    </Drawer.Navigator>
  )
}
