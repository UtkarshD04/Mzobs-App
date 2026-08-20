import { View } from 'react-native'
import { useTheme } from '../../theme'

const TONE_COLOR = { navy: 'navy', gold: 'goldDot', green: 'greenDot', teal: 'tealDot' }

export default function ProgressBar({ value = 0, tone = 'navy', style }) {
  const { colors, radius } = useTheme()
  const pct = Math.max(0, Math.min(100, value))
  const fillColor = colors[TONE_COLOR[tone] ?? TONE_COLOR.navy]

  return (
    <View style={[{ height: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceSunken, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fillColor, borderRadius: radius.sm }} />
    </View>
  )
}
