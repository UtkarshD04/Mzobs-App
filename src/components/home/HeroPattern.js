import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useReducedMotion,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '../../theme'

// Same signature "floating bubble" identity as the website's hero
// (HeroBubbleField.jsx's --bubble-*-rgb tones), scaled down to a small set
// that fits the compact mobile hero card without competing with the search
// UI on top of it. Each bubble is a soft tinted circle with a small
// off-center highlight, echoing the site's glass radial-gradient look
// without needing an SVG/blur dependency.
const BUBBLE_TONES = {
  blue: '37, 99, 235',
  teal: '11, 122, 109',
  gold: '198, 138, 31',
  purple: '124, 92, 232',
  pink: '236, 97, 163',
  orange: '237, 137, 54',
}

// Edge-hugging only — mostly clipped off-screen by the container's
// overflow:hidden, so they never sit on top of the centered headline/
// subtitle/toggle text between them (a wider spread used to drift a bubble
// straight over the subtitle copy).
const BUBBLES = [
  { size: 70, top: -22, left: -22, tone: 'blue', opacity: 0.22, dur: 5200, delay: 0 },
  { size: 40, top: -10, left: '82%', tone: 'purple', opacity: 0.2, dur: 4600, delay: 300 },
  { size: 22, top: 60, left: -10, tone: 'teal', opacity: 0.18, dur: 4200, delay: 500 },
  { size: 18, top: 76, left: '92%', tone: 'gold', opacity: 0.2, dur: 4800, delay: 200 },
]

function Bubble({ size, top, left, tone, opacity, dur, delay, reduceMotion }) {
  const rgb = BUBBLE_TONES[tone]
  const float = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) return
    float.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: dur, easing: Easing.inOut(Easing.sin) })), -1, false)
    )
  }, [reduceMotion])

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * -8 }] }))

  return (
    <Animated.View style={[{ position: 'absolute', top, left, width: size, height: size }, style]} pointerEvents="none">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `rgba(${rgb}, ${opacity})`,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.35)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.16,
          left: size * 0.18,
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size,
          backgroundColor: 'rgba(255,255,255,0.55)',
        }}
      />
    </Animated.View>
  )
}

export default function HeroPattern() {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()

  if (isDark) return null

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, overflow: 'hidden' }} pointerEvents="none">
      {BUBBLES.map((b, i) => (
        <Bubble key={i} {...b} reduceMotion={reduceMotion} />
      ))}
    </View>
  )
}
