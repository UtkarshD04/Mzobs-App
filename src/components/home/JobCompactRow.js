import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { fmtSalaryRange } from '../../lib/format'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import PressableScale from '../ui/PressableScale'

// Compact single-line job row used under the featured card in "Fresh
// opportunities" — a lighter-weight sibling of JobOpeningCard for scanning a
// couple more openings without repeating a full card's worth of chrome.
export default function JobCompactRow({ job, applied, onPress }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const salary = fmtSalaryRange(job)

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${job.title} at ${job.company}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Avatar name={job.company} size={40} style={{ borderRadius: radius.sm }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
          {job.company}
          {job.location ? `  ·  ${job.location}` : ''}
        </Text>
        {salary ? (
          <Text style={{ color: colors.green, fontFamily: fontFamily.semibold, fontSize: 11.5, marginTop: 3 }} numberOfLines={1}>
            {salary}
          </Text>
        ) : null}
      </View>
      {applied ? <Badge label="Applied" tone="green" /> : <Feather name="chevron-right" size={16} color={colors.inkTertiary} />}
    </PressableScale>
  )
}
