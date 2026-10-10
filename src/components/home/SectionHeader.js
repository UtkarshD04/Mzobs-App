import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Shared title row for Home sections — mirrors the website's section
// headings (20px bold title, 14px muted subtitle, no eyebrow chip) with an
// optional "See all" link. `statusLabel` is accepted for older callers but
// intentionally not rendered: the website's headings don't have one.
export default function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  const { colors, spacing, fontFamily } = useTheme()
  const teal = colors.navy

  return (
    <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
        <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }}>{title}</Text>

        {actionLabel ? (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 1, paddingTop: 4 }}>
            <Text style={{ color: teal, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{actionLabel}</Text>
            <Feather name="chevron-right" size={15} color={teal} />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
    </View>
  )
}
