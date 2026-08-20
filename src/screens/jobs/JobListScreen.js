import { useMemo, useState } from 'react'
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
import SearchBar from '../../components/ui/SearchBar'
import FilterChip from '../../components/ui/FilterChip'
import JobRowSkeleton from '../../components/ui/skeletons/JobRowSkeleton'

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']

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
  const { spacing } = useTheme()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile } = useProfileQuery()
  const [query, setQuery] = useState('')
  const [workMode, setWorkMode] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const matchesMode = workMode === 'All' || job.workMode === workMode
      if (!matchesMode) return false
      if (!q) return true
      const haystack = [job.title, job.company, job.location, ...(job.skills ?? [])].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [jobs, query, workMode])

  if (isLoading) return <JobRowSkeleton />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const eligible = profile?.resume?.status === 'verified'

  return (
    <ScreenContainer scroll={false}>
      <View style={{ marginBottom: spacing.sm }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search title, company or skill" />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {WORK_MODES.map((mode) => (
          <FilterChip key={mode} label={mode} active={workMode === mode} onPress={() => setWorkMode(mode)} />
        ))}
      </View>

      {!eligible ? (
        <View style={{ marginBottom: 8 }}>
          <Card>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Feather name="shield" size={16} color="#c68a1f" />
              <Text style={{ flex: 1, fontSize: 12.5 }}>Applications open once your resume is verified by the Mzobs team.</Text>
            </View>
          </Card>
        </View>
      ) : null}
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <JobRow
            job={item}
            applied={appliedJobIds.has(item.id)}
            onPress={() => navigation.navigate('JobDetail', { id: item.id })}
          />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase"
            title={query || workMode !== 'All' ? 'No matching openings' : 'No live openings right now'}
            message={query || workMode !== 'All' ? 'Try a different search term or filter.' : 'Check back soon for new requirements.'}
          />
        }
      />
    </ScreenContainer>
  )
}
