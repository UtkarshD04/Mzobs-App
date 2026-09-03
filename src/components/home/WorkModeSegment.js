import { View, Text, Pressable, Platform } from 'react-native'
import { useTheme } from '../../theme'

// A joined segmented control (single track, sliding active pill) rather than
// individual pills — gives the work-mode row a visibly different, more
// "secondary filter" feel than the filled teal quick-search chips above it.
export default function WorkModeSegment({ options, value, onChange }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceSunken,
        borderRadius: radius.md,
        padding: 3,
      }}
    >
      {options.map((option) => {
        const active = value === option
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              {
                flex: 1,
                paddingVertical: 7,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.surface : 'transparent',
              },
              active
                ? Platform.select({
                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.08, shadowRadius: 3 },
                    android: { elevation: 1 },
                  })
                : null,
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: active ? colors.ink : colors.inkTertiary,
                fontFamily: active ? fontFamily.semibold : fontFamily.medium,
                fontSize: 12.5,
              }}
            >
              {option}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
