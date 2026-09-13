import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, useReducedMotion, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated'

// A small, mobile-scale echo of the website's JobSearchHero bubble field
// (Website/Landing-Frontend/src/components/decor/HeroBubbleField.jsx) —
// soft, colored, floating orbs behind the Sign in / Sign up header block, so
// the app's auth screens read as the same product as the marketing site's
// hero instead of a plain, bubble-less form. RN has no CSS blur/gradient, so
// each bubble is a plain tinted circle with a small white sheen highlight —
// same tone palette (blue/teal/purple/pink/orange) and staggered float
// timing as the website's bubble-anim-float-* keyframes, just far fewer of
// them (6, not the desktop's 40+) since this sits behind a small header, not
// a full hero section.
const TONE_RGB = {
  blue: '37, 99, 235',
  teal: '11, 122, 109',
  purple: '124, 92, 232',
  pink: '236, 97, 163',
  orange: '237, 137, 54',
}

// top/left are % of the field's own box — kept out of the box's horizontal
// center so nothing sits directly behind the icon/logo/title text.
const BUBBLES = [
  { size: 64, top: '2%', left: '4%', tone: 'blue', amp: 8, dur: 3400, delay: 0 },
  { size: 40, top: '10%', left: '82%', tone: 'purple', amp: 10, dur: 3000, delay: 300 },
  { size: 26, top: '58%', left: '88%', tone: 'pink', amp: 7, dur: 2600, delay: 650 },
  { size: 30, top: '68%', left: '6%', tone: 'teal', amp: 9, dur: 3200, delay: 150 },
  { size: 18, top: '0%', left: '48%', tone: 'orange', amp: 6, dur: 2400, delay: 900 },
  { size: 16, top: '80%', left: '40%', tone: 'blue', amp: 6, dur: 2800, delay: 450 },
]

function Bubble({ b }) {
  const reduceMotion = useReducedMotion()
  const rgb = TONE_RGB[b.tone]
  const ty = useSharedValue(0)

  useEffect(() => {
    if (reduceMotion) return
    ty.value = withDelay(b.delay, withRepeat(withSequence(withTiming(-b.amp, { duration: b.dur }), withTiming(0, { duration: b.dur })), -1, true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: b.top,
          left: b.left,
          width: b.size,
          height: b.size,
          borderRadius: b.size / 2,
          backgroundColor: `rgba(${rgb}, 0.16)`,
          borderWidth: 1,
          borderColor: `rgba(${rgb}, 0.22)`,
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: b.size * 0.16,
          left: b.size * 0.18,
          width: b.size * 0.34,
          height: b.size * 0.34,
          borderRadius: b.size,
          backgroundColor: 'rgba(255,255,255,0.55)',
        }}
      />
    </Animated.View>
  )
}

export default function AuthBubbleField() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {BUBBLES.map((b, i) => (
        <Bubble key={i} b={b} />
      ))}
    </View>
  )
}
