import { Pressable, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function FilterChip({ label, active, onPress, icon }) {
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
        backgroundColor: active ? colors.navyTint : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.navy : colors.border,
        borderRadius: radius.xl,
        paddingVertical: 7,
        paddingHorizontal: 14,
      }}
    >
      {icon ? <Feather name={icon} size={12} color={active ? colors.navy : colors.inkSecondary} /> : null}
      <Text style={{ color: active ? colors.navy : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  )
}
