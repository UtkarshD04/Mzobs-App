import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useTheme } from '../../theme'

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const isDisabled = disabled || loading

  const variants = {
    primary: { bg: colors.navy, border: colors.navy, text: '#ffffff' },
    secondary: { bg: colors.surfaceHover, border: colors.border, text: colors.ink },
    danger: { bg: colors.redTint, border: colors.red, text: colors.red },
  }
  const v = variants[variant] ?? variants.primary

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={{ color: v.text, fontFamily: fontFamily.semibold, fontSize: 15 }}>{title}</Text>
      )}
    </Pressable>
  )
}
