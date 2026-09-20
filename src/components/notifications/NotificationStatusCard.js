import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useNotificationPermission } from '../../hooks/useNotificationPermission'
import Button from '../ui/Button'
import Card from '../ui/Card'

// Whether this phone will actually buzz for employer/Mzobs updates, with a one-tap
// fix when it won't. `variant="banner"` renders nothing once notifications are on
// (used on the Notifications screen); `variant="card"` always shows the status (Settings).
export default function NotificationStatusCard({ variant = 'card', style }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { status, enabled, blocked, supported, enable } = useNotificationPermission()

  if (status === 'unknown') return null
  if (!supported) {
    return variant === 'banner' ? null : (
      <Card style={style}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: 4 }}>Push notifications</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>
          Push notifications only work on a real phone, not an emulator.
        </Text>
      </Card>
    )
  }
  if (enabled && variant === 'banner') return null

  const title = enabled ? 'Notifications are on' : blocked ? 'Notifications are blocked' : 'Turn on notifications'
  const message = enabled
    ? 'You will get a notification on this phone when an employer or Mzobs sends you an update.'
    : blocked
      ? 'Notifications are turned off for MZOBS in your phone settings. Open settings and switch them on to get employer updates instantly.'
      : 'Get an alert the moment an employer views, shortlists or messages you, or invites you to an interview.'

  return (
    <Card style={[!enabled ? { backgroundColor: colors.navyTint, borderColor: colors.navyTintStrong } : null, style]}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Feather name={enabled ? 'bell' : 'bell-off'} size={17} color={enabled ? colors.green : colors.navy} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>{title}</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 3, lineHeight: 18 }}>{message}</Text>
          {!enabled ? (
            <Button
              title={blocked ? 'Open phone settings' : 'Turn on notifications'}
              onPress={enable}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start', paddingHorizontal: spacing.lg }}
            />
          ) : null}
        </View>
      </View>
    </Card>
  )
}
