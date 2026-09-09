import { View, Platform } from 'react-native'
import { useTheme } from '../../theme'

export default function Card({ children, style }) {
  const { colors, radius, spacing, isDark } = useTheme()
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
        Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isDark ? 0 : 1 },
            shadowOpacity: isDark ? 0.14 : 0.03,
            shadowRadius: 8,
          },
          android: { elevation: isDark ? 0 : 1 },
        }),
        style,
      ]}
    >
      {children}
    </View>
  )
}
