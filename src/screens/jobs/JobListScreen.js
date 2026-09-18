import { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, FlatList, Alert, Linking } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useJobsQuery } from '../../hooks/useJobs'
import { useApplicationsQuery } from '../../hooks/useApplications'
import { useProfileQuery } from '../../hooks/useProfile'
import { useDeviceLocation } from '../../hooks/useDeviceLocation'
import { DEFAULT_FILTERS, matchesFilters, matchesQuery } from '../../lib/jobFilters'
import { sortJobsByDistance, distanceToJob } from '../../lib/jobDistance'
import JobOpeningCard from '../../components/home/JobOpeningCard'
import ScreenContainer from '../../components/ui/ScreenContainer'
import EmptyState from '../../components/ui/EmptyState'
import SearchBar from '../../components/ui/SearchBar'
import FilterChip from '../../components/ui/FilterChip'
import EligibilityNote from '../../components/ui/EligibilityNote'
import JobRowSkeleton from '../../components/ui/skeletons/JobRowSkeleton'

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']

export default function JobListScreen({ navigation, route }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile } = useProfileQuery()
  const [query, setQuery] = useState('')
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [nearMe, setNearMe] = useState(false)
  const { coords, status: locationStatus, requestLocation } = useDeviceLocation()

  // JobFiltersScreen hands the applied filters/query back through route
  // params (a dedicated page, not a sheet, so there's no shared state to
  // lift). appliedQuery is checked for !== undefined since '' (a cleared
  // search) is a valid, falsy value that still needs applying.
  useEffect(() => {
    if (route.params?.appliedFilters) setFilters(route.params.appliedFilters)
    if (route.params?.appliedQuery !== undefined) setQuery(route.params.appliedQuery)
    if (route.params?.appliedFilters || route.params?.appliedQuery !== undefined) {
      navigation.setParams({ appliedFilters: undefined, appliedQuery: undefined })
    }
  }, [route.params?.appliedFilters, route.params?.appliedQuery])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const seen = new Set()
    const results = []
    for (const job of jobs) {
      for (const value of [job.title, job.company]) {
        if (value && value.toLowerCase().includes(q) && !seen.has(value)) {
          seen.add(value)
          results.push(value)
        }
      }
      if (results.length >= 5) break
    }
    return results
  }, [jobs, query])

  const filtered = useMemo(() => {
    const base = jobs.filter((job) => matchesFilters(job, filters) && matchesQuery(job, query))
    return nearMe && coords ? sortJobsByDistance(base, coords) : base
  }, [jobs, query, filters, nearMe, coords])

  if (isLoading) return <JobRowSkeleton />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const activeFilterCount = Object.keys(DEFAULT_FILTERS).filter((k) => filters[k] !== DEFAULT_FILTERS[k]).length

  function openFilters() {
    navigation.navigate('JobFilters', { filters, query, jobs })
  }

  async function handleToggleNearMe() {
    if (nearMe) {
      setNearMe(false)
      return
    }
    if (coords) {
      setNearMe(true)
      return
    }
    const result = await requestLocation()
    if (result.coords) {
      setNearMe(true)
    } else if (result.status === 'denied') {
      Alert.alert('Location access needed', 'Turn on location access for MZOBS to see nearby openings first.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ])
    }
  }

  return (
    <ScreenContainer
      scroll={false}
      header={
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.bg }}>
          <SearchBar
            value={query}
            onChangeText={(v) => {
              setQuery(v)
              setSuggestionsVisible(!!v)
            }}
            onFocus={() => setSuggestionsVisible(!!query)}
            onBlur={() => setTimeout(() => setSuggestionsVisible(false), 120)}
            placeholder="Search title, company or skill"
          />

          {suggestionsVisible && suggestions.length > 0 ? (
            <View
              style={{
                marginTop: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                overflow: 'hidden',
              }}
            >
              {suggestions.map((s, i) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    setQuery(s)
                    setSuggestionsVisible(false)
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: spacing.md,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <Feather name="search" size={13} color={colors.inkTertiary} />
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.regular, fontSize: 13.5 }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ flex: 1, flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              {WORK_MODES.map((mode) => (
                <FilterChip
                  key={mode}
                  label={mode}
                  active={filters.workMode === mode}
                  onPress={() => setFilters((f) => ({ ...f, workMode: mode }))}
                />
              ))}
              <FilterChip
                label={locationStatus === 'requesting' ? 'Locating…' : 'Near me'}
                icon="navigation"
                active={nearMe}
                onPress={handleToggleNearMe}
              />
            </View>
            <Pressable
              onPress={openFilters}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                minHeight: 40,
                paddingHorizontal: 12,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: activeFilterCount > 0 ? colors.navy : colors.border,
                backgroundColor: activeFilterCount > 0 ? colors.navyTint : colors.surface,
              }}
            >
              <Feather name="sliders" size={14} color={activeFilterCount > 0 ? colors.navy : colors.inkSecondary} />
              <Text
                style={{
                  color: activeFilterCount > 0 ? colors.navy : colors.inkSecondary,
                  fontFamily: fontFamily.semibold,
                  fontSize: 12.5,
                }}
              >
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={{ flex: 1 }}>
        <EligibilityNote verified={profile?.resume?.status === 'verified'} style={{ marginBottom: spacing.sm }} />

        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <JobOpeningCard
              job={item}
              applied={appliedJobIds.has(item.id)}
              index={index}
              distanceKm={nearMe && coords ? distanceToJob(item, coords) : null}
              onPress={() => navigation.navigate('JobDetail', { id: item.id })}
            />
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase"
              title={query || activeFilterCount > 0 ? 'No matching openings' : 'No live openings right now'}
              message={query || activeFilterCount > 0 ? 'Try a different search term or filter.' : 'Check back soon for new requirements.'}
            />
          }
        />
      </View>
    </ScreenContainer>
  )
}
