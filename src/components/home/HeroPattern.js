import { View } from 'react-native'
import { useTheme } from '../../theme'

// Purely decorative backdrop for the search hero — two soft, low-opacity
// circles built from plain Views (no image assets / SVG dependency) to give
// the panel some depth without competing with the search UI on top of it.
export default function HeroPattern() {
  const { colors } = useTheme()

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -50,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.teal,
          opacity: 0.1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 30,
          right: 60,
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: colors.ink,
          opacity: 0.04,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -70,
          left: -40,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: colors.teal,
          opacity: 0.06,
        }}
      />
    </View>
  )
}
