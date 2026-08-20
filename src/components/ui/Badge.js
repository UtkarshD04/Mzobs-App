import { View, Text } from 'react-native'
import { useTheme } from '../../theme'

// tone -> { text, tint } color keys in the theme palette (see theme/colors.js)
const TONES = {
  navy: ['navy', 'navyTint'],
  gold: ['goldStrong', 'goldTint'],
  green: ['green', 'greenTint'],
  red: ['red', 'redTint'],
  violet: ['violet', 'violetTint'],
  teal: ['teal', 'tealTint'],
  amber: ['amber', 'amberTint'],
  gray: ['inkSecondary', 'grayTint'],
}

export default function Badge({ label, tone = 'gray', style }) {
  const { colors, radius, fontFamily } = useTheme()
  const [textKey, tintKey] = TONES[tone] ?? TONES.gray

  return (
    <View
      style={[
        {
          backgroundColor: colors[tintKey],
          borderRadius: radius.sm,
          paddingVertical: 4,
          paddingHorizontal: 9,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: colors[textKey], fontFamily: fontFamily.semibold, fontSize: 12 }}>{label}</Text>
    </View>
  )
}
