import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, useReducedMotion, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated'

// A small, mobile-scale echo of the website's JobSearchHero bubble field
// (Website/Landing-Frontend/src/components/decor/HeroBubbleField.jsx) —
// soft, colored, floating orbs around the Sign in / Sign up icon badge, so
// the app's auth screens read as the same product as the marketing site's
// hero instead of a plain, bubble-less form. RN has no CSS blur/gradient, so
// each bubble is a plain tinted circle with a small white sheen highlight.
//
// Deliberately scoped to a fixed square around just the icon badge (not the
// whole header block) — same rule the website's hero follows: bubbles frame
// the real content, they never sit behind readable text. Positions below
// are tuned for a 160x160 box with the ~64px icon centered in it, so they
// ring the icon at its corners instead of drifting into the title/subtitle
// text underneath.
const TONE_RGB = {
  blue: '37, 99, 235',
  teal: '11, 122, 109',
  purple: '124, 92, 232',
  pink: '236, 97, 163',
  orange: '237, 137, 54',
}

const BUBBLES = [
  { size: 22, top: 4, left: 8, tone: 'blue', amp: 6, dur: 3000, delay: 0 },
  { size: 16, top: 10, left: 128, tone: 'purple', amp: 7, dur: 2600, delay: 300 },
  { size: 14, top: 120, left: 14, tone: 'teal', amp: 6, dur: 2800, delay: 600 },
  { size: 20, top: 118, left: 126, tone: 'pink', amp: 7, dur: 3200, delay: 150 },
  { size: 10, top: 66, left: 0, tone: 'orange', amp: 5, dur: 2400, delay: 450 },
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
          backgroundColor: `rgba(${rgb}, 0.18)`,
          borderWidth: 1,
          borderColor: `rgba(${rgb}, 0.25)`,
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
          backgroundColor: 'rgba(255,255,255,0.6)',
        }}
      />
    </Animated.View>
  )
}

// Self-centering: renders a 160x160 box positioned -48/-48 from its parent
// (so drop this as a sibling inside a `position: 'relative'` container the
// size of the icon badge, e.g. the 64px icon square below — 160 - 64 = 96,
// halved to 48 on each side) — never affects layout flow/spacing, and never
// drifts down into the title/subtitle text under the icon.
export default function AuthBubbleField() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -48, left: -48, width: 160, height: 160, overflow: 'hidden' }}>
      {BUBBLES.map((b, i) => (
        <Bubble key={i} b={b} />
      ))}
    </View>
  )
}
