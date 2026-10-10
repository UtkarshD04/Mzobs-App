import { View } from 'react-native'

// Progress ring built from two clipped half-circles (no SVG dependency): each
// half shows a rotated, two-sided coloured border, revealing up to 180°.
export default function ProgressRing({ percent, color, track, size: RING = 84, thickness: THICK = 6, children }) {
  const deg = Math.max(0, Math.min(100, percent)) * 3.6
  const half = (side) => {
    const isRight = side === 'right'
    const rotate = isRight ? Math.min(deg, 180) - 135 : Math.max(deg, 180) - 315
    return (
      <View style={{ position: 'absolute', top: 0, left: isRight ? RING / 2 : 0, width: RING / 2, height: RING, overflow: 'hidden' }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: isRight ? -RING / 2 : 0,
            width: RING,
            height: RING,
            borderRadius: RING / 2,
            borderWidth: THICK,
            borderColor: 'transparent',
            ...(isRight ? { borderTopColor: color, borderRightColor: color } : { borderBottomColor: color, borderLeftColor: color }),
            transform: [{ rotate: `${rotate}deg` }],
          }}
        />
      </View>
    )
  }
  return (
    <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: THICK, borderColor: track }} />
      {half('right')}
      {half('left')}
      {children}
    </View>
  )
}

