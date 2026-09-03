import { Pressable, Text } from 'react-native'
import { useTheme } from '../../theme'

export default function FilterChip({ label, active, onPress }) {
  const { colors, radius, fontFamily } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={{
        alignSelf: 'flex-start',
        backgroundColor: active ? colors.navy : colors.surfaceSunken,
        borderRadius: radius.xl,
        paddingVertical: 7,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: active ? '#ffffff' : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  )
}
