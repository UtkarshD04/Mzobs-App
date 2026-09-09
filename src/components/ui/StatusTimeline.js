import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

const STEPS = ['Applied', 'Under review', 'Shortlisted', 'Profile shared', 'Interview', 'Result']

export default function StatusTimeline({ stage, rejected }) {
  const { colors, fontFamily, spacing } = useTheme()

  return (
    <View style={{ marginTop: spacing.md }}>
      {STEPS.map((label, i) => {
        const stepIndex = i + 1
        const isLast = i === STEPS.length - 1
        const isRejectedHere = rejected && stepIndex === stage
        const done = stepIndex < stage
        const current = stepIndex === stage
        const reached = done || current

        const dotColor = isRejectedHere ? colors.red : reached ? colors.navy : colors.border
        const lineColor = done && !rejected ? colors.navy : colors.border
        const textColor = isRejectedHere ? colors.red : reached ? colors.ink : colors.inkTertiary
        const finalLabel = isLast ? (rejected ? 'Not selected' : stage >= STEPS.length ? 'Selected' : 'Result') : label

        return (
          <View key={label} style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', width: 20 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: reached || isRejectedHere ? dotColor : colors.surface,
                  borderWidth: reached || isRejectedHere ? 0 : 1.5,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done && !isRejectedHere ? <Feather name="check" size={8} color="#ffffff" /> : null}
              </View>
              {!isLast ? <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: lineColor, marginVertical: 2 }} /> : null}
            </View>
            <Text
              style={{
                color: textColor,
                fontFamily: current || isRejectedHere ? fontFamily.semibold : fontFamily.regular,
                fontSize: 13,
                marginLeft: spacing.sm,
                marginBottom: isLast ? 0 : spacing.md,
              }}
            >
              {finalLabel}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
