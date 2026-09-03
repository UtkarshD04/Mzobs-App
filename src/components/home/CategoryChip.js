import { Pressable, Text, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// `outline` gives a lighter-weight look (white/bordered, teal only when
// active) for secondary refinements — keeps the bold filled teal pill
// reserved for the primary category chips so the two rows read as a clear
// hierarchy instead of competing for attention.
export default function CategoryChip({ label, icon, active, onPress, outline = false }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()

  const bg = outline ? (active ? colors.tealTint : colors.surface) : active ? colors.teal : colors.tealTint
  const textColor = outline ? (active ? colors.teal : colors.inkSecondary) : active ? '#ffffff' : colors.teal
  const borderColor = outline ? (active ? colors.teal : colors.border) : 'transparent'

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: bg,
          borderRadius: radius.xl,
          borderWidth: outline ? 1 : 0,
          borderColor,
          paddingVertical: outline ? 7 : 8,
          paddingHorizontal: spacing.md,
        },
        !outline && active
          ? Platform.select({
              ios: { shadowColor: colors.teal, shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.35 : 0.28, shadowRadius: 6 },
              android: { elevation: 3 },
            })
          : null,
      ]}
    >
      {icon ? <Feather name={icon} size={13} color={textColor} /> : null}
      <Text style={{ color: textColor, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  )
}
