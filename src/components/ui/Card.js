import { View } from 'react-native'
import { useTheme } from '../../theme'

export default function Card({ children, style }) {
  const { colors, radius, spacing } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
