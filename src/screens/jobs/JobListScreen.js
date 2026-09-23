import { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, FlatList, Alert, Linking, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useJobsQuery } from '../../hooks/useJobs'
import { useApplicationsQuery } from '../../hooks/useApplications'
import { useProfileQuery } from '../../hooks/useProfile'
import { useDeviceLocation } from '../../hooks/useDeviceLocation'
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  WORK_MODE_OPTIONS,
  activeFilterChips,
  activeFilterCount as countActiveFilters,
  matchesFilters,
  matchesQuery,
  normalizeFilters,
  removeFilterValue,
  sortJobs,
  toggleFilterValue,
} from '../../lib/jobFilters'
import { sortJobsByDistance, distanceToJob } from '../../lib/jobDistance'
import JobOpeningCard from '../../components/home/JobOpeningCard'
import ScreenContainer from '../../components/ui/ScreenContainer'
import EmptyState from '../../components/ui/EmptyState'
import SearchBar from '../../components/ui/SearchBar'
import FilterChip from '../../components/ui/FilterChip'
import EligibilityNote from '../../components/ui/EligibilityNote'
import JobRowSkeleton from '../../components/ui/skeletons/JobRowSkeleton'


export default function JobListScreen({ navigation, route }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: profile } = useProfileQuery()
  const [query, setQuery] = useState('')
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [nearMe, setNearMe] = useState(false)
  const { coords, status: locationStatus, requestLocation, getPermissionState } = useDeviceLocation()

  // JobFiltersScreen hands the applied filters/query back through route
  // params (a dedicated page, not a sheet, so there's no shared state to
  // lift). appliedQuery is checked for !== undefined since '' (a cleared
  // search) is a valid, falsy value that still needs applying.
  useEffect(() => {
    if (route.params?.appliedFilters) setFilters(normalizeFilters(route.params.appliedFilters))
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
    // "Near me" is an explicit, opt-in ordering, so it wins over the chosen sort.
    return nearMe && coords ? sortJobsByDistance(base, coords) : sortJobs(base, filters.sort, query)
  }, [jobs, query, filters, nearMe, coords])

  if (isLoading) return <JobRowSkeleton />

  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))
  const activeFilterCount = countActiveFilters(filters)
  const appliedChips = activeFilterChips(filters, jobs)
  const sortLabel = nearMe && coords ? 'Nearest first' : SORT_OPTIONS.find((o) => o.id === filters.sort)?.label ?? 'Relevance'

  function openFilters(initialGroup) {
    navigation.navigate('JobFilters', { filters, query, jobs, initialGroup: typeof initialGroup === 'string' ? initialGroup : undefined })
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
    const permission = await getPermissionState()
    if (permission === 'blocked') {
      promptOpenSettings()
      return
    }
    // Before the system dialog, tell the user why we want their location and
    // how it's used — they can decline here without ever seeing the OS prompt.
    if (permission === 'undetermined') {
      const agreed = await askLocationConsent()
      if (!agreed) return
    }
    const result = await requestLocation()
    if (result.coords) {
      setNearMe(true)
    } else if (result.status === 'denied') {
      promptOpenSettings()
    }
  }

  function askLocationConsent() {
    return new Promise((resolve) => {
      Alert.alert(
        'Allow location access?',
        'MZOBS uses your device location only while you use the app, to show job openings near you first.\n\nYour location is used just once when you tap "Near me". It is not tracked in the background, and you can turn it off anytime in your phone settings.',
        [
          { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Allow', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      )
    })
  }

  function promptOpenSettings() {
    Alert.alert('Location access needed', 'Turn on location access for MZOBS in your phone settings to see nearby openings first.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open settings', onPress: () => Linking.openSettings() },
    ])
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

          {/* Quick row — Filters button first (like Naukri), then the one-tap options. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ marginTop: spacing.sm, flexGrow: 0 }}
            contentContainerStyle={{ gap: spacing.sm, alignItems: 'center', paddingRight: spacing.lg }}
          >
            <Pressable
              onPress={() => openFilters()}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                minHeight: 40,
                paddingHorizontal: 14,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: activeFilterCount > 0 ? colors.navy : colors.border,
                backgroundColor: activeFilterCount > 0 ? colors.navy : colors.surface,
              }}
            >
              <Feather name="sliders" size={14} color={activeFilterCount > 0 ? '#ffffff' : colors.inkSecondary} />
              <Text style={{ color: activeFilterCount > 0 ? '#ffffff' : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>
                Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
              </Text>
            </Pressable>
            <FilterChip
              label={locationStatus === 'requesting' ? 'Locating…' : 'Near me'}
              icon="navigation"
              active={nearMe}
              onPress={handleToggleNearMe}
            />
            {WORK_MODE_OPTIONS.map((mode) => (
              <FilterChip
                key={mode.id}
                label={mode.label}
                active={filters.workMode.includes(mode.id)}
                onPress={() => setFilters((f) => toggleFilterValue(f, 'workMode', mode.id))}
              />
            ))}
          </ScrollView>

          {/* Everything currently applied, each removable with one tap. */}
          {appliedChips.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: spacing.sm, flexGrow: 0 }}
              contentContainerStyle={{ gap: spacing.sm, alignItems: 'center', paddingRight: spacing.lg }}
            >
              {appliedChips.map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={() => setFilters((f) => removeFilterValue(f, chip.group, chip.value))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove filter ${chip.label}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingLeft: 12,
                    paddingRight: 8,
                    borderRadius: radius.xl,
                    backgroundColor: colors.navyTint,
                    borderWidth: 1,
                    borderColor: colors.navyTintStrong,
                  }}
                >
                  <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12 }}>{chip.label}</Text>
                  <Feather name="x" size={13} color={colors.navy} />
                </Pressable>
              ))}
              <Pressable onPress={() => setFilters(DEFAULT_FILTERS)} accessibilityRole="button" hitSlop={8}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 12.5, paddingHorizontal: spacing.xs }}>Clear all</Text>
              </Pressable>
            </ScrollView>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md }}>
            <View>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.bold, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Total jobs
              </Text>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: 1 }}>
                {filtered.length} <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13 }}>{filtered.length === 1 ? 'opportunity' : 'opportunities'}</Text>
              </Text>
            </View>
            <Pressable
              onPress={() => openFilters('sort')}
              accessibilityRole="button"
              accessibilityLabel={`Sort: ${sortLabel}. Change sort order`}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>Sort:</Text>
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{sortLabel}</Text>
              <Feather name="chevron-down" size={14} color={colors.navy} />
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={{ flex: 1 }}>
        <EligibilityNote verified={profile?.resume?.status === 'verified'} navigation={navigation} style={{ marginBottom: spacing.sm }} />

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
