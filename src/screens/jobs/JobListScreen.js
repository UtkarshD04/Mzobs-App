import { View, Text, Pressable, FlatList } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useJobsQuery } from '../../hooks/useJobs'
import { useApplicationsQuery } from '../../hooks/useApplications'
import { useProfileQuery } from '../../hooks/useProfile'
import { fmtSalaryRange } from '../../lib/format'
import ScreenContainer from '../../components/ui/ScreenContainer'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function JobRow({ job, applied, onPress }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>{job.title}</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 3 }}>
              {job.company} · {job.location} · {job.workMode}
            </Text>
          </View>
          {applied ? <Badge label="Applied" tone="green" /> : null}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
          {fmtSalaryRange(job) ? (
            <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13 }}>{fmtSalaryRange(job)}</Text>
          ) : null}
          {job.posted ? <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>Posted {job.posted}</Text> : null}
        </View>

        {(job.skills ?? []).length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
            {job.skills.slice(0, 4).map((skill) => (
              <View key={skill} style={{ backgroundColor: colors.surfaceSunken, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 8 }}>
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 11 }}>{skill}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Pressable>
  )
}

export default function JobListScreen({ navigation }) {
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile } = useProfileQuery()

  if (isLoading) return <LoadingSpinner />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const eligible = profile?.resume?.status === 'verified'

  return (
    <ScreenContainer scroll={false}>
      <View style={{ marginBottom: 8 }}>
        {!eligible ? (
          <Card>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Feather name="shield" size={16} color="#c68a1f" />
              <Text style={{ flex: 1, fontSize: 12.5 }}>Applications open once your resume is verified by the Mzobs team.</Text>
            </View>
          </Card>
        ) : null}
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobRow job={item} applied={appliedJobIds.has(item.id)} onPress={() => navigation.navigate('JobDetail', { id: item.id })} />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="briefcase" title="No live openings right now" message="Check back soon for new requirements." />}
      />
    </ScreenContainer>
  )
}
