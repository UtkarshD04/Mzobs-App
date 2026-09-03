import { View, Text, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function CategoryTile({ label, icon, count, tone = 'teal', active, onPress }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()
  const dotColor = colors[tone] ?? colors.teal
  const tintColor = colors[`${tone}Tint`] ?? colors.tealTint
  const hasNoOpenings = count === 0

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        {
          width: 108,
          backgroundColor: active ? tintColor : colors.surface,
          borderRadius: radius.md,
          borderWidth: active ? 1.5 : 1,
          borderColor: active ? dotColor : colors.border,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
          alignItems: 'flex-start',
          marginRight: spacing.sm,
          opacity: hasNoOpenings && !active ? 0.72 : 1,
        },
        Platform.select({
          ios: {
            shadowColor: active ? dotColor : '#000',
            shadowOffset: { width: 0, height: active ? 3 : 1 },
            shadowOpacity: isDark ? (active ? 0.3 : 0) : active ? 0.16 : 0.04,
            shadowRadius: active ? 6 : 4,
          },
          android: { elevation: active ? 2 : 0 },
        }),
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.sm,
            backgroundColor: dotColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name={icon} size={15} color="#ffffff" />
        </View>
        <Feather name="chevron-right" size={13} color={active ? dotColor : colors.inkTertiary} style={{ opacity: 0.7 }} />
      </View>
      <Text
        numberOfLines={1}
        style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5, marginTop: spacing.sm }}
      >
        {label}
      </Text>
      {count != null ? (
        <Text
          style={{
            color: hasNoOpenings ? colors.inkTertiary : active ? dotColor : colors.inkSecondary,
            fontFamily: hasNoOpenings ? fontFamily.regular : fontFamily.semibold,
            fontSize: 11,
            marginTop: 1,
          }}
        >
          {count} open
        </Text>
      ) : null}
    </Pressable>
  )
}
