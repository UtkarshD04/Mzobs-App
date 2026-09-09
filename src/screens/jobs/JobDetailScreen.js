import { useState } from 'react'
import { View, Text, Pressable, Share } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useJobQuery } from '../../hooks/useJobs'
import { useApplicationsQuery, useApplyToJobMutation } from '../../hooks/useApplications'
import { useProfileQuery } from '../../hooks/useProfile'
import { fmtSalaryRange, fmtExperience, fmtDate } from '../../lib/format'
import ScreenContainer from '../../components/ui/ScreenContainer'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Tag from '../../components/ui/Tag'
import Avatar from '../../components/ui/Avatar'
import EligibilityNote from '../../components/ui/EligibilityNote'
import JobDetailSkeleton from '../../components/ui/skeletons/JobDetailSkeleton'

function daysSince(dateValue) {
  if (!dateValue) return null
  return Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24))
}

// One "At a glance" fact cell — small round tinted icon badge beside a
// two-line label/value stack, matching the website's FactTile treatment
// (a loose grouped grid, not a bordered table).
function FactTile({ icon, label, value }) {
  const { colors, radius, fontFamily } = useTheme()
  if (!value) return null
  return (
    <View style={{ flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 36, height: 36, borderRadius: radius.lg, backgroundColor: colors.tealTint, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={15} color={colors.teal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>{label}</Text>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 14, marginTop: 1 }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function Section({ icon, title, children }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
        <Feather name={icon} size={14} color={colors.navy} />
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>{title}</Text>
      </View>
      {children}
    </Card>
  )
}

function IconAction({ icon, active, onPress, accessibilityLabel }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: active ? colors.navy : colors.border,
        backgroundColor: active ? colors.navyTint : colors.surface,
      }}
    >
      <Feather name={icon} size={17} color={active ? colors.navy : colors.inkSecondary} />
    </Pressable>
  )
}

const DESCRIPTION_CLAMP = 5

export default function JobDetailScreen({ route, navigation }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const { id } = route.params
  const { data: job, isLoading } = useJobQuery(id)
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile, isLoading: profileLoading } = useProfileQuery()
  const applyMutation = useApplyToJobMutation()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  if (isLoading || profileLoading || !job) return <JobDetailSkeleton />

  const applied = applications.some((a) => (a.jobId ?? a.job?.id) === id)
  const paid = profile?.subscription?.status === 'paid'
  const verified = profile?.resume?.status === 'verified'
  const eligible = paid && verified
  const days = daysSince(job.postedOn)
  const isNew = days !== null && days <= 1
  const salary = fmtSalaryRange(job)

  async function handleApply() {
    setError('')
    try {
      await applyMutation.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not submit your application. Please try again.')
    }
  }

  function handleShare() {
    Share.share({ message: `${job.title} at ${job.company}${job.location ? ` — ${job.location}` : ''}, via Mzobs.` })
  }

  return (
    <ScreenContainer
      style={{ paddingBottom: spacing.lg }}
      footer={
        <View style={{ padding: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
          {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.sm }}>{error}</Text> : null}
          {applied ? (
            <Badge label="Applied — with Mzobs" tone="green" style={{ alignSelf: 'center' }} />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button title="Apply through Mzobs" onPress={handleApply} loading={applyMutation.isPending} disabled={!eligible} style={{ flex: 1 }} />
              <IconAction icon="bookmark" active={saved} onPress={() => setSaved((v) => !v)} accessibilityLabel={saved ? 'Remove from saved' : 'Save job'} />
              <IconAction icon="share-2" onPress={handleShare} accessibilityLabel="Share job" />
            </View>
          )}
        </View>
      }
    >
      <View
        style={{
          backgroundColor: colors.tealTint,
          borderRadius: radius.lg,
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              borderRadius: radius.lg + 2,
              padding: 2,
              marginRight: spacing.md,
              backgroundColor: colors.surface,
            }}
          >
            <Avatar name={job.company} size={56} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
              <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.bold, fontSize: 19 }}>{job.title}</Text>
              {isNew ? <Badge label="New" tone="teal" /> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              <Feather name="briefcase" size={11.5} color={colors.inkSecondary} />
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13 }}>{job.company}</Text>
              {job.location ? <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}> · {job.location}</Text> : null}
              {job.workMode ? <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}> · {job.workMode}</Text> : null}
            </View>
            {salary ? <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 16, marginTop: 6 }}>{salary}</Text> : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md }}>
          <Feather name="shield" size={12} color={colors.teal} />
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>
            Applications are reviewed by the Mzobs team before reaching the employer.
          </Text>
        </View>
        {job.postedOn ? (
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 4 }}>
            Posted {fmtDate(job.postedOn)}
          </Text>
        ) : null}
      </View>

      <Section icon="grid" title="At a glance">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.sm }}>
          <FactTile icon="briefcase" label="Experience" value={fmtExperience(job)} />
          <FactTile icon="tag" label="Employment type" value={job.employmentType} />
          <FactTile icon="layers" label="Department" value={job.department} />
          <FactTile icon="users" label="Vacancies" value={job.vacancies} />
        </View>
      </Section>

      {job.description ? (
        <Section icon="file-text" title="Job description">
          <Text
            style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}
            numberOfLines={descriptionExpanded ? undefined : DESCRIPTION_CLAMP}
          >
            {job.description}
          </Text>
          {job.description.length > 220 ? (
            <Pressable onPress={() => setDescriptionExpanded((v) => !v)} hitSlop={6} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>
                {descriptionExpanded ? 'Show less' : 'Read full description'}
              </Text>
            </Pressable>
          ) : null}
        </Section>
      ) : null}

      {(job.skills ?? []).length > 0 ? (
        <Section icon="cpu" title="Skills">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {job.skills.map((skill) => (
              <Tag key={skill} label={skill} />
            ))}
          </View>
        </Section>
      ) : null}

      {job.benefits ? (
        <Section icon="gift" title="Why this role stands out">
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }}>{job.benefits}</Text>
        </Section>
      ) : null}

      {!applied && !eligible ? <EligibilityNote paid={paid} verified={verified} navigation={navigation} style={{ marginTop: spacing.lg }} /> : null}
    </ScreenContainer>
  )
}
