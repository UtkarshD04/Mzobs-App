import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, useReducedMotion, withSpring } from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// Shared tap feedback for Home's cards/chips/rows — scales down slightly on
// press and springs back, instead of every tappable surface re-implementing
// its own shared-value + animated-style boilerplate.
export default function PressableScale({ children, style, scaleTo = 0.97, ...pressableProps }) {
  const reduceMotion = useReducedMotion()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      {...pressableProps}
      onPressIn={(e) => {
        scale.value = withSpring(reduceMotion ? 1 : scaleTo, { damping: 18, stiffness: 380 })
        pressableProps.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 18, stiffness: 380 })
        pressableProps.onPressOut?.(e)
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  )
}
