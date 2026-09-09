import { Pressable, Text } from 'react-native'
import { useTheme } from '../../theme'

export default function FilterChip({ label, active, onPress }) {
  const { colors, radius, fontFamily } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        alignSelf: 'flex-start',
        minHeight: 40,
        justifyContent: 'center',
        backgroundColor: active ? colors.navyTint : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.navy : colors.border,
        borderRadius: radius.xl,
        paddingVertical: 7,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: active ? colors.navy : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  )
}
