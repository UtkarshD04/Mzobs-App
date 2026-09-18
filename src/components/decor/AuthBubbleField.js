import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, useReducedMotion, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated'

// A small, mobile-scale echo of the website's JobSearchHero bubble field
// (Website/Landing-Frontend/src/components/decor/HeroBubbleField.jsx) —
// soft, colored, floating orbs around the Sign in / Sign up brand logo, so
// the app's auth screens read as the same product as the marketing site's
// hero instead of a plain, bubble-less form. RN has no CSS blur/gradient, so
// each bubble is a plain tinted circle with a small white sheen highlight.
//
// Deliberately scoped to a fixed box around just the logo (not the whole
// header block) — same rule the website's hero follows: bubbles frame the
// real content, they never sit behind readable text. FIELD_W/H below is
// centered on a ~44-tall/~81-wide logo (see BrandLogo's own aspect ratio),
// so every bubble sits safely outside that central rectangle.
const TONE_RGB = {
  blue: '37, 99, 235',
  teal: '11, 122, 109',
  purple: '124, 92, 232',
  pink: '236, 97, 163',
  orange: '237, 137, 54',
}

const FIELD_W = 180
const FIELD_H = 90
// Offsets to center this field on its parent (a logo-sized box) —
// (FIELD_W - logoWidth) / 2, (FIELD_H - logoHeight) / 2.
const OFFSET_X = -50
const OFFSET_Y = -23

// Kept to the top/sides of the logo only — the field used to extend well
// below the logo box and visually crowd the tagline text right under it.
const BUBBLES = [
  { size: 16, top: 4, left: 6, tone: 'blue', amp: 6, dur: 3000, delay: 0 },
  { size: 12, top: 8, left: 160, tone: 'purple', amp: 7, dur: 2600, delay: 300 },
  { size: 10, top: 54, left: 2, tone: 'teal', amp: 5, dur: 2800, delay: 600 },
  { size: 10, top: 58, left: 166, tone: 'orange', amp: 5, dur: 2700, delay: 450 },
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
          backgroundColor: `rgba(${rgb}, 0.12)`,
          borderWidth: 1,
          borderColor: `rgba(${rgb}, 0.18)`,
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

// Drop as a sibling inside a `position: 'relative'` container sized to the
// logo (see LoginScreen.js/SignupScreen.js) — anchors itself via negative
// top/left so it never affects that container's layout/spacing.
export default function AuthBubbleField() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: OFFSET_Y, left: OFFSET_X, width: FIELD_W, height: FIELD_H, overflow: 'hidden' }}>
      {BUBBLES.map((b, i) => (
        <Bubble key={i} b={b} />
      ))}
    </View>
  )
}
