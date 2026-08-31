import { useState } from 'react'
import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useJobQuery } from '../../hooks/useJobs'
import { useApplicationsQuery, useApplyToJobMutation } from '../../hooks/useApplications'
import { useProfileQuery } from '../../hooks/useProfile'
import { fmtSalaryRange } from '../../lib/format'
import ScreenContainer from '../../components/ui/ScreenContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tag from '../../components/ui/Tag'
import EligibilityNote from '../../components/ui/EligibilityNote'
import JobDetailSkeleton from '../../components/ui/skeletons/JobDetailSkeleton'

function MetaRow({ icon, text }) {
  const { colors, fontFamily } = useTheme()
  if (!text) return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Feather name={icon} size={13} color={colors.inkTertiary} />
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13 }}>{text}</Text>
    </View>
  )
}

export default function JobDetailScreen({ route, navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { id } = route.params
  const { data: job, isLoading } = useJobQuery(id)
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile, isLoading: profileLoading } = useProfileQuery()
  const applyMutation = useApplyToJobMutation()
  const [error, setError] = useState('')

  if (isLoading || profileLoading || !job) return <JobDetailSkeleton />

  const applied = applications.some((a) => (a.jobId ?? a.job?.id) === id)
  const paid = profile?.subscription?.status === 'paid'
  const verified = profile?.resume?.status === 'verified'
  const eligible = paid && verified

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
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 14, marginTop: 4 }}>{job.company}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm }}>
        <MetaRow icon="map-pin" text={job.location} />
        <MetaRow icon="home" text={job.workMode} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }}>
        {fmtSalaryRange(job) ? <Badge label={fmtSalaryRange(job)} tone="navy" /> : null}
        {job.employmentType ? <Badge label={job.employmentType} tone="gray" /> : null}
        {job.department ? <Badge label={job.department} tone="gray" /> : null}
      </View>

      {(job.skills ?? []).length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md }}>
          {job.skills.map((skill) => (
            <Tag key={skill} label={skill} />
          ))}
        </View>
      ) : null}

      {job.description ? (
        <Card style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
            <Feather name="file-text" size={14} color={colors.navy} />
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>About the role</Text>
          </View>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}>{job.description}</Text>
        </Card>
      ) : null}

      {job.benefits ? (
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
            <Feather name="gift" size={14} color={colors.navy} />
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>Benefits</Text>
          </View>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}>{job.benefits}</Text>
        </Card>
      ) : null}

      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginTop: spacing.lg }}>{error}</Text> : null}

      {!applied && !eligible ? <EligibilityNote paid={paid} verified={verified} navigation={navigation} style={{ marginTop: spacing.xl }} /> : null}

      <View style={{ marginTop: spacing.xl }}>
        {applied ? (
          <Badge label="Applied — with Mzobs" tone="green" />
        ) : (
          <Button title="Apply through Mzobs" onPress={handleApply} loading={applyMutation.isPending} disabled={!eligible} />
        )}
      </View>
    </ScreenContainer>
  )
}
