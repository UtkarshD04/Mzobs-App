import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Shared title row for Home sections — keeps typography and the optional
// "See all" affordance consistent across sections. statusLabel renders as an
// eyebrow line above the title (not inline beside it) so a long, wrapping
// title never collides with it or with the action label — both anchored to
// the top of the block via alignItems: 'flex-start' instead of 'center'.
export default function SectionHeader({ title, statusLabel, subtitle, actionLabel, onAction }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
      {statusLabel ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 4,
            backgroundColor: colors.navyTint,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 20,
            marginBottom: 4,
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.navy }} />
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 10.5 }}>{statusLabel}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>{title}</Text>

        {actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 1, paddingTop: 1 }}
          >
            <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 13 }}>{actionLabel}</Text>
            <Feather name="chevron-right" size={15} color={colors.navy} />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
    </View>
  )
}
