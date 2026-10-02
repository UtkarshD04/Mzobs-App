import { View } from 'react-native'
import { useTheme } from '../../theme'

// Mirrors the website's CURRENT hero background (Hero.jsx's ambient wash):
// three large, softly-tinted glow blobs over the flat --color-mz-bg base —
// NOT the older "explorer" HeroBubbleField glass-bubble look this file used
// to render (small bordered circles with a highlight, confined to a thin
// strip at the very top). RN has no CSS blur filter without an extra native
// dependency, so each glow is faked with concentric rings of the same tint
// at falling opacity (center densest, edge near-invisible) instead of an
// actual blurred circle — same visual effect at a glance, no new native
// module to rebuild for.
const GLOWS = [
  { color: '124, 108, 255', top: -80, left: -110, size: 340, peak: 0.05 }, // --color-mz-secondary
  { color: '91, 141, 239', top: 0, left: '56%', size: 360, peak: 0.05 }, // website's #5b8def
  { color: '32, 201, 151', top: 440, left: '14%', size: 300, peak: 0.045 }, // --color-mz-accent
]

// 8 concentric rings, opacity easing in with the square of distance from the
// edge (not linear) — linear falloff still reads as a visible ring at the
// outermost step; squaring keeps every step past the center imperceptibly
// faint, closer to an actual Gaussian blur's fast-decaying edge.
const RING_COUNT = 16
const RINGS = Array.from({ length: RING_COUNT }, (_, i) => 1 - i / RING_COUNT)

function Glow({ color, top, left, size, peak }) {
  return (
    <View style={{ position: 'absolute', top, left, width: size, height: size }}>
      {RINGS.map((factor, i) => {
        const ringSize = size * factor
        const t = 1 - factor
        const alpha = peak * (1 - t * t)
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: (size - ringSize) / 2,
              left: (size - ringSize) / 2,
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: `rgba(${color}, ${alpha})`,
            }}
          />
        )
      })}
    </View>
  )
}

export default function HeroPattern() {
  const { isDark } = useTheme()

  if (isDark) return null

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 760, overflow: 'hidden' }} pointerEvents="none">
      {GLOWS.map((g, i) => (
        <Glow key={i} {...g} />
      ))}
    </View>
  )
}
