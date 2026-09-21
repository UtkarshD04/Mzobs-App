import { useMemo, useState } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '../theme'
import { useJobsQuery, useRecommendedJobsQuery, useAppliedBasedJobsQuery, useInstantHiringJobsQuery } from '../hooks/useJobs'
import { useApplicationsQuery } from '../hooks/useApplications'
import { useProfileQuery } from '../hooks/useProfile'
import { useNotificationsQuery } from '../hooks/useNotifications'
import EmptyState from '../components/ui/EmptyState'
import JobRowSkeleton from '../components/ui/skeletons/JobRowSkeleton'
import HomeTopBar from '../components/home/HomeTopBar'
import JobSearchSection from '../components/home/JobSearchSection'
import SectionHeader from '../components/home/SectionHeader'
import CompaniesHiringSection from '../components/home/CompaniesHiringSection'
import CategoryGrid from '../components/home/CategoryGrid'
import HotJobsByCitySection from '../components/home/HotJobsByCitySection'
import JobCardCarousel from '../components/home/JobCardCarousel'
import JobsSection from '../components/home/JobsSection'
import HomeProgressCard from '../components/home/HomeProgressCard'
import { jobMatchesCategory } from '../components/home/categoryData'
import { locationKey, locationOptions } from '../lib/jobFilters'

const MAX_VISIBLE_JOBS = 5

export default function HomeScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: profile } = useProfileQuery()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: notifications = [] } = useNotificationsQuery()
  const { data: recommendedJobs = [], isLoading: isLoadingRecommended } = useRecommendedJobsQuery()
  const { data: appliedBasedJobs = [], isLoading: isLoadingAppliedBased } = useAppliedBasedJobsQuery()
  const { data: instantHiringJobs = [], isLoading: isLoadingInstantHiring } = useInstantHiringJobsQuery()

  const [selectedCategory, setSelectedCategory] = useState('all')

  const unreadCount = notifications.filter((n) => n.unread).length
  const resumeStatus = profile?.resume?.status ?? 'none'

  const filtered = useMemo(() => jobs.filter((job) => jobMatchesCategory(job, selectedCategory)), [jobs, selectedCategory])

  if (isLoading) return <JobRowSkeleton />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const visibleJobs = filtered.slice(0, MAX_VISIBLE_JOBS)
  const hasActiveFilters = selectedCategory !== 'all'

  function goTo(screen) {
    navigation.navigate(screen)
  }

  // Hero search: keyword, location and experience go to the Jobs tab's
  // Search & Filters page, which lists the matching openings. A location that
  // matches a known city becomes a location filter; anything else is folded
  // into the keyword search (which also matches job locations).
  function openSearch({ query = '', location = '', experience = null } = {}) {
    const filters = {}
    let keyword = query
    if (location) {
      const wanted = locationKey(location)
      const city = locationOptions(jobs).find((o) => o.id === wanted || o.id.includes(wanted))
      if (city) filters.location = [city.id]
      else if (!keyword) keyword = location
    }
    if (experience !== null && experience !== undefined) filters.experience = experience
    navigation.navigate('Jobs', { screen: 'JobFilters', params: { query: keyword, filters, jobs } })
  }

  let progressVariant = 'progress'
  if (resumeStatus === 'none') progressVariant = 'resume'

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
          <JobSearchSection onOpenSearch={openSearch} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(280)} style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="Fresh opportunities"
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
                message={hasActiveFilters ? 'Try a different search term or category.' : 'Check back soon for new requirements.'}
              />
            </View>
          ) : (
            <JobCardCarousel
              jobs={visibleJobs}
              appliedJobIds={appliedJobIds}
              onPressJob={(job) => navigation.navigate('JobDetail', { id: job.id })}
            />
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(280)}>
          <HotJobsByCitySection onOpenSearch={openSearch} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(280)}>
          <CategoryGrid jobs={jobs} onSelectCategory={setSelectedCategory} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(280)}>
          <CompaniesHiringSection onSeeAll={() => goTo('Jobs')} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(280)}>
          <JobsSection
            title="Jobs based on your profile"
            subtitle="Matched to your skills, track, and location."
            jobs={recommendedJobs}
            isLoading={isLoadingRecommended}
            appliedJobIds={appliedJobIds}
            onSeeAll={() => goTo('Jobs')}
            onPressJob={(job) => navigation.navigate('JobDetail', { id: job.id })}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(280)}>
          <JobsSection
            title="Jobs based on your applies"
            subtitle="Like the roles you've already applied to."
            jobs={appliedBasedJobs}
            isLoading={isLoadingAppliedBased}
            appliedJobIds={appliedJobIds}
            onSeeAll={() => goTo('Jobs')}
            onPressJob={(job) => navigation.navigate('JobDetail', { id: job.id })}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(280)}>
          <JobsSection
            title="Urgent hiring"
            subtitle={profile?.isPremium ? 'Companies looking to hire right away.' : 'Companies hiring right away. Applying is for premium members.'}
            jobs={instantHiringJobs}
            isLoading={isLoadingInstantHiring}
            appliedJobIds={appliedJobIds}
            onSeeAll={() => goTo('Jobs')}
            onPressJob={(job) => navigation.navigate('JobDetail', { id: job.id })}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(280)} style={{ marginTop: spacing.xl }}>
          <HomeProgressCard variant={progressVariant} applicationsCount={applications.length} onNavigate={goTo} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
