import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Shared title row for Home sections — keeps typography and the optional
// "See all" affordance consistent across Latest opportunities / Companies
// hiring now instead of each section hand-rolling its own header markup.
export default function SectionHeader({ title, statusLabel, subtitle, actionLabel, onAction }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>{title}</Text>
          {statusLabel ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: colors.tealTint,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 20,
              }}
            >
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.teal }} />
              <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 10.5 }}>{statusLabel}</Text>
            </View>
          ) : null}
        </View>

        {actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}
          >
            <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 13 }}>{actionLabel}</Text>
            <Feather name="chevron-right" size={15} color={colors.teal} />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
    </View>
  )
}
