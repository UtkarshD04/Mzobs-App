import { View, Text, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

function CardShell({ accentTone, children }) {
  const { colors, spacing, radius, isDark } = useTheme()
  const rail = colors[accentTone] ?? colors.teal

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          marginHorizontal: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 8 },
          android: { elevation: isDark ? 0 : 1 },
        }),
      ]}
    >
      <View style={{ width: 4, backgroundColor: rail }} />
      <View style={{ flex: 1, padding: spacing.md }}>{children}</View>
    </View>
  )
}

function ActionCard({ icon, accentTone, title, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const accent = colors[accentTone] ?? colors.teal
  const accentTint = colors[`${accentTone}Tint`] ?? colors.tealTint

  return (
    <CardShell accentTone={accentTone}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: accentTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name={icon} size={15} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13.5 }}>{title}</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{message}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
        <Pressable
          onPress={onPrimary}
          accessibilityRole="button"
          style={{ backgroundColor: accent, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 14 }}
        >
          <Text style={{ color: '#ffffff', fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{primaryLabel}</Text>
        </Pressable>
        {secondaryLabel ? (
          <Pressable onPress={onSecondary} accessibilityRole="button" hitSlop={6}>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </CardShell>
  )
}

function ProgressStat({ icon, value, label }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: colors.tealTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon} size={13} color={colors.teal} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13.5 }}>{value}</Text>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 10.5, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

export default function HomeProgressCard({ variant, fee, applicationsCount, onNavigate }) {
  const { colors, spacing, fontFamily } = useTheme()

  if (variant === 'activate') {
    return (
      <ActionCard
        icon="unlock"
        accentTone="amber"
        title="Activate your placement account"
        message={`Pay ₹${fee} one-time to unlock job applications and interviews.`}
        primaryLabel={`Pay ₹${fee} to activate`}
        onPrimary={() => onNavigate('Subscription')}
      />
    )
  }

  if (variant === 'resume') {
    return (
      <ActionCard
        icon="file-text"
        accentTone="teal"
        title="Add your resume"
        message="A strong resume helps you stand out and get shortlisted faster."
        primaryLabel="Upload resume"
        onPrimary={() => onNavigate('Resume')}
        secondaryLabel="View profile"
        onSecondary={() => onNavigate('Profile')}
      />
    )
  }

  return (
    <CardShell accentTone="green">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="check-circle" size={14} color={colors.green} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13.5 }}>Your job search, at a glance</Text>
        </View>
        <Pressable onPress={() => onNavigate('Applications')} accessibilityRole="button" hitSlop={6}>
          <Feather name="arrow-up-right" size={16} color={colors.teal} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
        <ProgressStat icon="check-circle" value={applicationsCount} label="Applications" />
        <ProgressStat icon="file-text" value="Ready" label="Resume" />
        <ProgressStat icon="shield" value="Active" label="Account" />
      </View>
    </CardShell>
  )
}
