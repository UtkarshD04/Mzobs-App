import { useState } from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../../theme'
import { useJobQuery } from '../../hooks/useJobs'
import { useApplicationsQuery, useApplyToJobMutation } from '../../hooks/useApplications'
import { fmtSalaryRange } from '../../lib/format'
import ScreenContainer from '../../components/ui/ScreenContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function JobDetailScreen({ route }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const { id } = route.params
  const { data: job, isLoading } = useJobQuery(id)
  const { data: applications = [] } = useApplicationsQuery()
  const applyMutation = useApplyToJobMutation()
  const [error, setError] = useState('')

  if (isLoading || !job) return <LoadingSpinner />

  const applied = applications.some((a) => (a.jobId ?? a.job?.id) === id)

  async function handleApply() {
    setError('')
    try {
      await applyMutation.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not submit your application. Please try again.')
    }
  }

  return (
    <ScreenContainer>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>{job.title}</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
        {job.company} · {job.location} · {job.workMode}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
        {fmtSalaryRange(job) ? <Badge label={fmtSalaryRange(job)} tone="navy" /> : null}
        {job.employmentType ? <Badge label={job.employmentType} tone="gray" /> : null}
        {job.department ? <Badge label={job.department} tone="gray" /> : null}
      </View>

      {(job.skills ?? []).length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md }}>
          {job.skills.map((skill) => (
            <View key={skill} style={{ backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 11.5 }}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {job.description ? (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.sm }}>About the role</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}>{job.description}</Text>
        </Card>
      ) : null}

      {job.benefits ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.sm }}>Benefits</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}>{job.benefits}</Text>
        </Card>
      ) : null}

      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginTop: spacing.lg }}>{error}</Text> : null}

      <View style={{ marginTop: spacing.xl }}>
        {applied ? (
          <Badge label="Applied — with Mzobs" tone="green" />
        ) : (
          <Button title="Apply through Mzobs" onPress={handleApply} loading={applyMutation.isPending} />
        )}
      </View>
    </ScreenContainer>
  )
}
