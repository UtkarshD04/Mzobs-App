import { View, Text } from 'react-native'
import { useTheme } from '../../theme'

export default function Tag({ label, style }) {
  const { colors, radius, fontFamily } = useTheme()
  return (
    <View
      style={[
        { backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 9 },
        style,
      ]}
    >
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.1 }}>{label}</Text>
    </View>
  )
}
