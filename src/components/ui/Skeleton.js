import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useTheme } from '../../theme'

export default function Skeleton({ width = '100%', height = 14, radius: cornerRadius, style }) {
  const { colors, radius } = useTheme()
  const opacity = useSharedValue(0.45)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: cornerRadius ?? radius.sm, backgroundColor: colors.surfaceSunken },
        animStyle,
        style,
      ]}
    />
  )
}
