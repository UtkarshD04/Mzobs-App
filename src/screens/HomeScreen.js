import { useMemo, useState } from 'react'
import { View, Text, Pressable, FlatList } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useJobsQuery } from '../hooks/useJobs'
import { useApplicationsQuery } from '../hooks/useApplications'
import { useProfileQuery } from '../hooks/useProfile'
import { fmtSalaryRange } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Tag from '../components/ui/Tag'
import EmptyState from '../components/ui/EmptyState'
import SearchBar from '../components/ui/SearchBar'
import FilterChip from '../components/ui/FilterChip'
import JobRowSkeleton from '../components/ui/skeletons/JobRowSkeleton'

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatChip({ icon, label }) {
  const { colors, fontFamily } = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.navyTint,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </View>
  )
}

function JobOpeningCard({ job, applied, index, onPress }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(220)}>
      <Pressable onPress={onPress}>
        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Avatar name={job.company} size={44} style={{ marginRight: spacing.md }} />
            <View style={{ flex: 1 }}>
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
                {job.posted ? (
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>Posted {job.posted}</Text>
                ) : null}
                {job.vacancies ? (
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>
                    {job.vacancies} opening{job.vacancies > 1 ? 's' : ''}
                  </Text>
                ) : null}
              </View>

              {(job.skills ?? []).length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
                  {job.skills.slice(0, 4).map((skill) => (
                    <Tag key={skill} label={skill} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  )
}

export default function HomeScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { employee } = useAuth()
  const { data: profile } = useProfileQuery()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const [query, setQuery] = useState('')
  const [workMode, setWorkMode] = useState('All')

  const firstName = (profile?.name ?? employee?.name ?? '').split(' ')[0]

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

  return (
    <ScreenContainer scroll={false}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 22 }}>
        {greeting()}, {firstName || 'there'}
      </Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, marginBottom: spacing.md }}>
        Live job openings picked for you today.
      </Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <StatChip label={`${jobs.length} live opening${jobs.length === 1 ? '' : 's'}`} />
        <StatChip label={`${applications.length} applied`} />
      </View>

      <View style={{ marginBottom: spacing.sm }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search title, company or skill" />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        {WORK_MODES.map((mode) => (
          <FilterChip key={mode} label={mode} active={workMode === mode} onPress={() => setWorkMode(mode)} />
        ))}
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <JobOpeningCard
            job={item}
            applied={appliedJobIds.has(item.id)}
            index={index}
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
