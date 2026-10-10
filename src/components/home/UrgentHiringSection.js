import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import JobOpeningCard from './JobOpeningCard'

const LIMIT = 2

// Mirrors the website's UrgentHiringSection.jsx: roles staff flagged as
// urgent-to-fill (Job.instantHiring), listed under an amber "Urgent hiring"
// heading. Renders nothing while there are none.
export default function UrgentHiringSection({ jobs, appliedJobIds, onPressJob }) {
  const { colors, spacing, fontFamily, isDark } = useTheme()
  const urgent = jobs.filter((j) => j.instantHiring).slice(0, LIMIT)
  if (urgent.length === 0) return null

  return (
    <View style={{ marginTop: 28, paddingHorizontal: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md }}>
        <View style={{ width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? colors.amberTint : '#fef3c7' }}>
          <Feather name="zap" size={17} color={isDark ? colors.amber : '#b45309'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }}>Urgent hiring</Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 2 }}>Companies that need to fill these roles fast</Text>
        </View>
      </View>
      {urgent.map((job, i) => (
        <JobOpeningCard key={job.id} job={job} index={i} applied={appliedJobIds.has(job.id)} onPress={() => onPressJob(job)} />
      ))}
    </View>
  )
}
