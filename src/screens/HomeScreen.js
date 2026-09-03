import { useMemo, useState } from 'react'
import { View, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '../theme'
import { useJobsQuery } from '../hooks/useJobs'
import { useApplicationsQuery } from '../hooks/useApplications'
import { useProfileQuery } from '../hooks/useProfile'
import { useSubscriptionQuery } from '../hooks/useSubscription'
import { useNotificationsQuery } from '../hooks/useNotifications'
import EmptyState from '../components/ui/EmptyState'
import JobRowSkeleton from '../components/ui/skeletons/JobRowSkeleton'
import HomeTopBar from '../components/home/HomeTopBar'
import JobSearchSection from '../components/home/JobSearchSection'
import CategorySection from '../components/home/CategorySection'
import SectionHeader from '../components/home/SectionHeader'
import CompaniesHiringSection from '../components/home/CompaniesHiringSection'
import JobOpeningCard from '../components/home/JobOpeningCard'
import HomeProgressCard from '../components/home/HomeProgressCard'
import { jobMatchesCategory } from '../components/home/categoryData'

const WORK_MODE_DEFAULT = 'All'
const MAX_VISIBLE_JOBS = 6

export default function HomeScreen({ navigation }) {
  const { colors, spacing } = useTheme()
  const { data: profile } = useProfileQuery()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: subscription } = useSubscriptionQuery()
  const { data: notifications = [] } = useNotificationsQuery()

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [workMode, setWorkMode] = useState(WORK_MODE_DEFAULT)

  const unreadCount = notifications.filter((n) => n.unread).length
  const isPaid = subscription?.status === 'paid'
  const fee = subscription?.amount ?? 299
  const resumeStatus = profile?.resume?.status ?? 'none'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      if (workMode !== 'All' && job.workMode !== workMode) return false
      if (!jobMatchesCategory(job, selectedCategory)) return false
      if (!q) return true
      const haystack = [job.title, job.company, job.location, ...(job.skills ?? [])].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [jobs, query, workMode, selectedCategory])

  if (isLoading) return <JobRowSkeleton />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const visibleJobs = filtered.slice(0, MAX_VISIBLE_JOBS)
  const hasActiveFilters = !!query || selectedCategory !== 'all' || workMode !== 'All'

  function goTo(screen) {
    navigation.navigate(screen)
  }

  let progressVariant = 'progress'
  if (!isPaid) progressVariant = 'activate'
  else if (resumeStatus === 'none') progressVariant = 'resume'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right']}>
      <HomeTopBar navigation={navigation} unreadCount={unreadCount} />

      {/* A plain vertical ScrollView (not a FlatList) is the outer container on
          purpose: RN's VirtualizedList wraps ListHeaderComponent/ListFooterComponent
          in cell views that can swallow touch-move gestures meant for a nested
          horizontal scroller (the Companies row) before it claims the responder.
          Job cards are a handful at most (MAX_VISIBLE_JOBS), so plain views cost
          nothing — horizontal FlatLists/ScrollViews below are a different scroll
          axis than this container, so no same-direction nesting either. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.teal} />}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <JobSearchSection
            query={query}
            onChangeQuery={setQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            workMode={workMode}
            onSelectWorkMode={setWorkMode}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(280)}>
          <CategorySection jobs={jobs} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(280)} style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="Latest opportunities"
            statusLabel="Fresh roles"
            subtitle={
              hasActiveFilters
                ? `${filtered.length} matching opening${filtered.length === 1 ? '' : 's'}`
                : `${filtered.length} live opening${filtered.length === 1 ? '' : 's'}`
            }
            actionLabel="See all"
            onAction={() => goTo('Jobs')}
          />

          {visibleJobs.length === 0 ? (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EmptyState
                icon="briefcase"
                title={hasActiveFilters ? 'No matching openings' : 'No live openings right now'}
                message={hasActiveFilters ? 'Try a different search term, category or filter.' : 'Check back soon for new requirements.'}
              />
            </View>
          ) : (
            <View style={{ paddingHorizontal: spacing.lg }}>
              {visibleJobs.map((job, index) => (
                <JobOpeningCard
                  key={job.id}
                  job={job}
                  applied={appliedJobIds.has(job.id)}
                  index={index}
                  onPress={() => navigation.navigate('JobDetail', { id: job.id })}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(280)}>
          <CompaniesHiringSection onSeeAll={() => goTo('Jobs')} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(280)} style={{ marginTop: spacing.xl }}>
          <HomeProgressCard variant={progressVariant} fee={fee} applicationsCount={applications.length} onNavigate={goTo} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
