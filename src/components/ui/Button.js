import { Pressable, Text, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useTheme } from '../../theme'

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const isDisabled = disabled || loading
  const scale = useSharedValue(1)
  const wrapperStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const variants = {
    primary: { bg: colors.navy, border: colors.navy, text: '#ffffff' },
    secondary: { bg: colors.surfaceHover, border: colors.border, text: colors.ink },
    danger: { bg: colors.redTint, border: colors.red, text: colors.red },
    gold: { bg: colors.goldTint, border: colors.goldTint, text: colors.goldStrong },
  }
  const v = variants[variant] ?? variants.primary

  return (
    <Animated.View style={[wrapperStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15, stiffness: 400 })
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 })
        }}
        style={{
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={v.text} />
        ) : (
          <Text style={{ color: v.text, fontFamily: fontFamily.semibold, fontSize: 15 }}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  )
}
