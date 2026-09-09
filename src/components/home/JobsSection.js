import { View } from 'react-native'
import { useTheme } from '../../theme'
import JobCardCarousel from './JobCardCarousel'
import SectionHeader from './SectionHeader'

const MAX_VISIBLE = 8

// Shared shell for the three personalized Home rows (recommended / based on
// applies / instant hiring) — same header + card pattern as "Fresh
// opportunities", just fed by a different query. Renders nothing while
// loading or when the query comes back empty, so a thin profile or an
// account with no applications yet doesn't leave an empty section on screen.
export default function JobsSection({ title, statusLabel, subtitle, jobs = [], isLoading, appliedJobIds, onSeeAll, onPressJob }) {
  const { spacing } = useTheme()
  if (isLoading || jobs.length === 0) return null

  const visible = jobs.slice(0, MAX_VISIBLE)

  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHeader
        title={title}
        statusLabel={statusLabel}
        subtitle={subtitle}
        actionLabel={jobs.length > MAX_VISIBLE ? 'See all' : undefined}
        onAction={onSeeAll}
      />
      <JobCardCarousel jobs={visible} appliedJobIds={appliedJobIds} onPressJob={onPressJob} />
    </View>
  )
}
