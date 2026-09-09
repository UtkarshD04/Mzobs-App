import { Pressable, Text, ActivityIndicator } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from '../../theme'

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const isDisabled = disabled || loading
  const reduceMotion = useReducedMotion()
  const scale = useSharedValue(1)
  const sheen = useSharedValue(-1)
  const wrapperStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  // A narrow, rotated highlight sweeping left-to-right on press — a restrained
  // echo of the website's diagonal button sheen, not a flashy loop.
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: sheen.value < 0.98 ? 0.16 : 0,
    transform: [{ translateX: sheen.value * 220 }, { rotate: '-18deg' }],
  }))

  const variants = {
    primary: { bg: colors.navy, border: colors.navy, text: '#ffffff' },
    secondary: { bg: colors.surface, border: colors.border, text: colors.ink },
    danger: { bg: colors.redTint, border: colors.red, text: colors.red },
    gold: { bg: colors.goldTint, border: colors.goldTint, text: colors.goldStrong },
  }
  const v = variants[variant] ?? variants.primary

  return (
    <Animated.View style={[wrapperStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPressIn={() => {
          scale.value = withSpring(reduceMotion ? 1 : 0.96, { damping: 15, stiffness: 400 })
          if (variant === 'primary' && !reduceMotion) {
            sheen.value = -1
            sheen.value = withTiming(1, { duration: 380 })
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 })
        }}
        style={{
          backgroundColor: v.bg,
          borderWidth: 1,
          borderColor: v.border,
          borderRadius: radius.sm,
          paddingVertical: spacing.md,
          minHeight: 48,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {variant === 'primary' ? (
          <Animated.View
            pointerEvents="none"
            style={[
              { position: 'absolute', top: -20, bottom: -20, left: '50%', width: 40, marginLeft: -20, backgroundColor: '#ffffff' },
              sheenStyle,
            ]}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={v.text} />
        ) : (
          <Text style={{ color: v.text, fontFamily: fontFamily.semibold, fontSize: 15 }}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  )
}
