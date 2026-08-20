import { View, Text } from 'react-native'
import { useTheme } from '../../theme'

function initialsOf(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({ name, size = 56, style }) {
  const { colors, fontFamily } = useTheme()

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.navyTint,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.navyTintStrong,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: size * 0.36 }}>{initialsOf(name)}</Text>
    </View>
  )
}
