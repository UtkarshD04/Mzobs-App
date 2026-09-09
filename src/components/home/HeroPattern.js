import { View } from 'react-native'
import { useTheme } from '../../theme'

// Purely decorative backdrop for the search hero — a single, very low-opacity
// soft-teal shape (a plain View, no image/SVG dependency) that adds a hint of
// depth without competing with the search UI on top of it.
export default function HeroPattern() {
  const { colors } = useTheme()

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          top: -90,
          right: -70,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.teal,
          opacity: 0.06,
        }}
      />
    </View>
  )
}
