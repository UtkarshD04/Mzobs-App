import { View, Text, Pressable } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useNotificationsQuery } from '../hooks/useNotifications'
import { useProfileQuery } from '../hooks/useProfile'
import BrandLogo from '../components/ui/BrandLogo'
import Avatar from '../components/ui/Avatar'

function getActiveRouteName(state) {
  const route = state.routes[state.index]
  if (route.state) return getActiveRouteName(route.state)
  return route.name
}

const VERIFICATION = [
  { icon: 'home', label: 'Home', target: { screen: 'Main', params: { screen: 'Home' } }, match: 'HomeFeed' },
  { icon: 'user', label: 'Profile', target: { screen: 'Main', params: { screen: 'Profile' } }, match: 'Profile' },
  { icon: 'file-text', label: 'Resume Center', target: { screen: 'Main', params: { screen: 'Resume' } }, match: 'Resume' },
]
const PLACEMENT = [
  { icon: 'briefcase', label: 'Job Openings', target: { screen: 'Main', params: { screen: 'Jobs' } }, match: 'JobList' },
  { icon: 'bookmark', label: 'Saved Jobs', target: { screen: 'SavedJobs' }, match: 'SavedJobs' },
  { icon: 'clipboard', label: 'My Applications', target: { screen: 'Main', params: { screen: 'Applications' } }, match: 'Applications' },
]
const ACCOUNT = [
  { icon: 'bell', label: 'Notifications', target: { screen: 'Notifications' }, match: 'Notifications', badgeKey: 'notifications' },
  { icon: 'credit-card', label: 'Subscription', target: { screen: 'Subscription' }, match: 'Subscription' },
  { icon: 'settings', label: 'Settings', target: { screen: 'Settings' }, match: 'Settings' },
]

function Row({ icon, label, active, badge, onPress }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: 10,
          paddingHorizontal: spacing.md,
          borderRadius: 9,
          backgroundColor: active ? colors.navyTint : 'transparent',
          borderLeftWidth: 3,
          borderLeftColor: active ? colors.navy : 'transparent',
          marginBottom: 2,
        }}
      >
        <Feather name={icon} size={17} color={active ? colors.navy : colors.inkSecondary} />
        <Text style={{ flex: 1, color: active ? colors.navy : colors.ink, fontFamily: active ? fontFamily.semibold : fontFamily.medium, fontSize: 13.5 }}>
          {label}
        </Text>
        {badge ? (
          <View style={{ backgroundColor: colors.goldTint, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
            <Text style={{ color: colors.goldStrong, fontFamily: fontFamily.bold, fontSize: 11 }}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

function GroupLabel({ children }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Text
      style={{
        color: colors.inkTertiary,
        fontFamily: fontFamily.bold,
        fontSize: 11,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: spacing.md,
        marginBottom: 6,
        marginLeft: spacing.md,
      }}
    >
      {children}
    </Text>
  )
}

export default function DrawerContent(props) {
  const { colors, spacing, fontFamily } = useTheme()
  const { logout, employee } = useAuth()
  const { data: profile } = useProfileQuery()
  const { data: notifications = [] } = useNotificationsQuery()
  const unreadCount = notifications.filter((n) => n.unread).length
  const activeRoute = getActiveRouteName(props.state)

  const badges = { notifications: unreadCount > 0 ? unreadCount : null }

  function go(item) {
    props.navigation.closeDrawer()
    if (item.target.params) props.navigation.navigate(item.target.screen, item.target.params)
    else props.navigation.navigate(item.target.screen)
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: spacing.lg, paddingHorizontal: spacing.sm, paddingBottom: spacing.lg }}>
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <BrandLogo height={28} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.navy,
          borderRadius: 14,
          padding: spacing.md,
          marginHorizontal: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Avatar name={profile?.name ?? employee?.name} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ffffff', fontFamily: fontFamily.semibold, fontSize: 14 }} numberOfLines={1}>
            {profile?.name ?? employee?.name ?? 'Candidate'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.68)', fontFamily: fontFamily.regular, fontSize: 12 }} numberOfLines={1}>
            {profile?.email ?? employee?.email ?? ''}
          </Text>
        </View>
      </View>

      {VERIFICATION.map((item) => (
        <Row key={item.label} {...item} active={activeRoute === item.match} onPress={() => go(item)} />
      ))}

      <GroupLabel>Placement</GroupLabel>
      {PLACEMENT.map((item) => (
        <Row key={item.label} {...item} active={activeRoute === item.match} onPress={() => go(item)} />
      ))}

      <GroupLabel>Account</GroupLabel>
      {ACCOUNT.map((item) => (
        <Row key={item.label} {...item} active={activeRoute === item.match} badge={badges[item.badgeKey]} onPress={() => go(item)} />
      ))}

      <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Row icon="life-buoy" label="Support" active={activeRoute === 'Support'} onPress={() => go({ target: { screen: 'Support' } })} />
        <Row icon="shield" label="Privacy Policy" active={activeRoute === 'PrivacyPolicy'} onPress={() => go({ target: { screen: 'PrivacyPolicy' } })} />
        <Row icon="file-text" label="Terms & Conditions" active={activeRoute === 'TermsAndConditions'} onPress={() => go({ target: { screen: 'TermsAndConditions' } })} />
        <Row icon="log-out" label="Log out" onPress={logout} />
      </View>
    </DrawerContentScrollView>
  )
}
