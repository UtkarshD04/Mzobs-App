import { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, RefreshControl, Linking } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '../theme'
import { useJobsQuery } from '../hooks/useJobs'
import { useApplicationsQuery } from '../hooks/useApplications'
import { useProfileQuery } from '../hooks/useProfile'
import { useNotificationsQuery } from '../hooks/useNotifications'
import EmptyState from '../components/ui/EmptyState'
import HomeSkeleton from '../components/ui/skeletons/HomeSkeleton'
import ErrorState from '../components/ui/ErrorState'
import JobSearchSection from '../components/home/JobSearchSection'
import CareerToolkit from '../components/home/CareerToolkit'
import { openDrawer } from '../lib/navigation'
import { profileCompletion } from '../lib/dashboard'
import QuickDiscoveryStrip from '../components/home/QuickDiscoveryStrip'
import CompaniesHiringSection from '../components/home/CompaniesHiringSection'
import CategoryGrid from '../components/home/CategoryGrid'
import JobOpeningCard from '../components/home/JobOpeningCard'
import UrgentHiringSection from '../components/home/UrgentHiringSection'
import CampusSection from '../components/home/CampusSection'
import JobFeedFilters from '../components/home/JobFeedFilters'
import JobFiltersSheet from '../components/home/JobFiltersSheet'
import { DEFAULT_FILTERS, activeFilterCount, locationKey, locationOptions, matchesFilters, matchesQuery, normalizeFilters, sortJobs } from '../lib/jobFilters'

const MAX_VISIBLE_JOBS = 4

export default function HomeScreen({ navigation, route }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: jobs = [], isLoading, isError, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile } = useProfileQuery()
  const { data: notifications = [] } = useNotificationsQuery()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [feedQuery, setFeedQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // The filter page hands the applied filters/search back through route params.
  useEffect(() => {
    if (route.params?.appliedFilters) setFilters(normalizeFilters(route.params.appliedFilters))
    if (route.params?.appliedQuery !== undefined) setFeedQuery(route.params.appliedQuery)
    if (route.params?.appliedFilters || route.params?.appliedQuery !== undefined) {
      navigation.setParams({ appliedFilters: undefined, appliedQuery: undefined })
    }
  }, [route.params?.appliedFilters, route.params?.appliedQuery])

  const unreadCount = notifications.filter((n) => n.unread).length

  const filtered = useMemo(
    () => sortJobs(jobs.filter((job) => matchesFilters(job, filters) && matchesQuery(job, feedQuery)), filters.sort, feedQuery),
    [jobs, filters, feedQuery],
  )

  if (isLoading) return <HomeSkeleton />
  if (isError && jobs.length === 0)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ErrorState title="Couldn't load openings" onRetry={refetch} retrying={isRefetching} />
      </SafeAreaView>
    )

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const visibleJobs = filtered.slice(0, MAX_VISIBLE_JOBS)
  const hasActiveFilters = activeFilterCount(filters) > 0 || !!feedQuery

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

  function openTool(key) {
    if (key === 'resume') navigation.navigate('Main', { screen: 'Resume' })
    else if (key === 'applications') navigation.navigate('Main', { screen: 'Applications' })
    else if (key === 'profile') navigation.navigate('Main', { screen: 'Profile' })
    else if (key === 'saved') navigation.navigate('SavedJobs')
    else if (key === 'plans') navigation.navigate('Subscription')
    else if (key === 'support') navigation.navigate('Support')
  }

  return (
    // No 'top' edge here on purpose — the hero's gradient/bubbles now bleed
    // behind the status bar, with HomeFloatingNav (a position:absolute
    // overlay, like the website's `position: fixed` navbar) handling its own
    // safe-area inset instead of a flat opaque bar sitting above everything.
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['left', 'right']}>
      {/* A plain vertical ScrollView (not a FlatList) is the outer container on
          purpose: RN's VirtualizedList wraps ListHeaderComponent/ListFooterComponent
          in cell views that can swallow touch-move gestures meant for a nested
          horizontal scroller (the Companies row) before it claims the responder.
          Job cards are a handful at most (MAX_VISIBLE_JOBS), so plain views cost
          nothing — horizontal FlatLists/ScrollViews below are a different scroll
          axis than this container, so no same-direction nesting either. */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 0 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.teal} />}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <JobSearchSection
            onOpenSearch={openSearch}
            onFilters={(q) => openSearch({ query: q })}
            onMenu={() => openDrawer(navigation)}
            onBell={() => navigation.navigate('Notifications')}
            onProfile={() => navigation.navigate('Main', { screen: 'Profile' })}
            unreadCount={unreadCount}
            profileName={profile?.name}
            profilePercent={profile ? profileCompletion(profile) : 0}
          >
            <QuickDiscoveryStrip onOpenSearch={openSearch} />
          </JobSearchSection>
        </Animated.View>

        <CareerToolkit onPress={openTool} />

        {/* Job feed — website's JobMarketplace ("Latest opportunities"), a
            vertical list of JobListItem-style cards. */}
        <Animated.View entering={FadeInDown.delay(140).duration(280)} style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }}>Latest opportunities</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 2 }}>
                {filtered.length} open {filtered.length === 1 ? 'role' : 'roles'}
                {hasActiveFilters ? ' match your filters' : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => setFiltersOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              style={{
                height: 40,
                paddingHorizontal: 14,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: hasActiveFilters ? colors.navy : colors.surface,
                borderWidth: 1,
                borderColor: hasActiveFilters ? colors.navy : colors.borderStrong,
              }}
            >
              <Feather name="sliders" size={16} color={hasActiveFilters ? '#fff' : colors.ink} />
              <Text style={{ color: hasActiveFilters ? '#fff' : colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>
                Filters{activeFilterCount(filters) + (feedQuery ? 1 : 0) > 0 ? ` · ${activeFilterCount(filters) + (feedQuery ? 1 : 0)}` : ''}
              </Text>
            </Pressable>
          </View>

          <JobFeedFilters
            filters={filters}
            query={feedQuery}
            jobs={jobs}
            onChange={setFilters}
            onClearQuery={() => setFeedQuery('')}
            onOpenFilters={() => setFiltersOpen(true)}
          />

          {visibleJobs.length === 0 ? (
            <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
              <EmptyState
                icon="briefcase"
                title={hasActiveFilters ? 'No matching openings' : 'No live openings right now'}
                message={hasActiveFilters ? 'Try removing a filter or searching a different keyword.' : 'Check back soon for new requirements.'}
              />
            </View>
          ) : (
            <View style={{ marginTop: spacing.md, paddingHorizontal: spacing.lg }}>
              {visibleJobs.map((job, index) => (
                <JobOpeningCard
                  key={job.id}
                  job={job}
                  index={index}
                  applied={appliedJobIds.has(job.id)}
                  onPress={() => navigation.navigate('JobDetail', { id: job.id })}
                />
              ))}
              {filtered.length > visibleJobs.length ? (
                <Pressable
                  onPress={() => navigation.navigate('Jobs', { screen: 'JobList', params: { appliedFilters: filters, appliedQuery: feedQuery } })}
                  accessibilityRole="button"
                  style={{ height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>View all {filtered.length} jobs</Text>
                  <Feather name="arrow-right" size={15} color={colors.ink} />
                </Pressable>
              ) : null}
            </View>
          )}
        </Animated.View>

        <UrgentHiringSection jobs={jobs} appliedJobIds={appliedJobIds} onPressJob={(job) => navigation.navigate('JobDetail', { id: job.id })} />

        <Animated.View entering={FadeInDown.delay(220).duration(280)}>
          <CategoryGrid jobs={jobs} onSelectCategory={(id) => setFilters((f) => ({ ...f, category: [id] }))} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(280)}>
          <CampusSection
            onCreateProfile={() => navigation.navigate('Main', { screen: 'Profile' })}
            onBecomeAlly={() => Linking.openURL('https://mzobs.com/ally')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(280)}>
          <CompaniesHiringSection onSeeAll={() => goTo('Jobs')} />
        </Animated.View>

      </Animated.ScrollView>

      <JobFiltersSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} query={feedQuery} jobs={jobs} resultCount={filtered.length} onChange={setFilters} />

    </SafeAreaView>
  )
}
