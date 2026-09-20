import { useMemo, useState } from 'react'
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import SearchBar from '../../components/ui/SearchBar'
import Button from '../../components/ui/Button'
import {
  DEFAULT_FILTERS,
  DEPARTMENT_OPTIONS,
  EXPERIENCE_QUICK_PICKS,
  MAX_EXPERIENCE,
  POSTED_OPTIONS,
  SALARY_OPTIONS,
  SORT_OPTIONS,
  WORK_MODE_OPTIONS,
  activeFilterCount,
  companyOptions,
  facetCount,
  groupSelectionCount,
  jobTypeOptions,
  locationOptions,
  matchesFilters,
  matchesQuery,
  normalizeFilters,
  toggleFilterValue,
} from '../../lib/jobFilters'

// Naukri-style filter page: a rail of filter groups on the left, the options of
// the selected group on the right (multi-select with live job counts), and a
// sticky "Show N jobs" bar. Applying passes filters + search text back to JobList
// through route params. Also the landing page for the Home search box, which
// hands in `query` and the full `jobs` list.
const GROUPS = [
  { id: 'sort', label: 'Sort by', kind: 'single' },
  { id: 'workMode', label: 'Work mode', kind: 'multi' },
  { id: 'category', label: 'Department', kind: 'multi' },
  { id: 'experience', label: 'Experience', kind: 'experience' },
  { id: 'salary', label: 'Salary', kind: 'multi' },
  { id: 'jobType', label: 'Job type', kind: 'multi' },
  { id: 'location', label: 'Location', kind: 'multi', searchable: true },
  { id: 'company', label: 'Company', kind: 'multi', searchable: true },
  { id: 'posted', label: 'Freshness', kind: 'single' },
]

const RAIL_WIDTH = 116

function OptionRow({ label, count, selected, multi, onPress }) {
  const { colors, spacing, fontFamily } = useTheme()
  const icon = multi ? (selected ? 'check-square' : 'square') : selected ? 'check-circle' : 'circle'
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 11 }}
    >
      <Feather name={icon} size={19} color={selected ? colors.navy : colors.inkTertiary} />
      <Text style={{ flex: 1, color: colors.ink, fontFamily: selected ? fontFamily.semibold : fontFamily.regular, fontSize: 14 }}>{label}</Text>
      {count != null ? (
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>({count})</Text>
      ) : null}
    </Pressable>
  )
}

function ExperiencePicker({ value, onChange }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const stepButton = (icon, delta, disabled) => (
    <Pressable
      onPress={() => onChange(Math.min(MAX_EXPERIENCE, Math.max(0, (value ?? 0) + delta)))}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={delta > 0 ? 'Increase experience' : 'Decrease experience'}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Feather name={icon} size={18} color={colors.ink} />
    </Pressable>
  )

  return (
    <View>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>
        Show jobs suited to your years of experience.
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        {stepButton('minus', -1, value == null || value <= 0)}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: value == null ? colors.inkTertiary : colors.ink, fontFamily: fontFamily.bold, fontSize: 30 }}>
            {value == null ? 'Any' : value}
          </Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12 }}>
            {value == null ? 'experience' : value === 1 ? 'year' : 'years'}
          </Text>
        </View>
        {stepButton('plus', 1, value != null && value >= MAX_EXPERIENCE)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {[null, ...EXPERIENCE_QUICK_PICKS].map((n) => {
          const active = value === n
          return (
            <Pressable
              key={String(n)}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: active ? colors.navy : colors.border,
                backgroundColor: active ? colors.navyTint : colors.surface,
              }}
            >
              <Text style={{ color: active ? colors.navy : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>
                {n == null ? 'Any' : n === 0 ? 'Fresher' : `${n} ${n === 1 ? 'yr' : 'yrs'}`}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function JobFiltersScreen({ navigation, route }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const { filters: initialFilters, query: initialQuery = '', jobs = [], initialGroup } = route.params ?? {}
  const [draft, setDraft] = useState(() => normalizeFilters(initialFilters))
  const [query, setQuery] = useState(initialQuery)
  const [activeGroup, setActiveGroup] = useState(initialGroup ?? 'workMode')
  const [optionSearch, setOptionSearch] = useState('')

  const options = useMemo(
    () => ({
      location: locationOptions(jobs),
      company: companyOptions(jobs),
      jobType: jobTypeOptions(jobs),
    }),
    [jobs]
  )

  // Groups with nothing to choose from (e.g. no job has a job type yet) drop out of the rail.
  const groups = GROUPS.filter((g) => !(g.id in options) || options[g.id].length > 0)
  const group = groups.find((g) => g.id === activeGroup) ?? groups[0]

  const resultCount = useMemo(
    () => jobs.filter((job) => matchesFilters(job, draft) && matchesQuery(job, query)).length,
    [jobs, draft, query]
  )
  const totalActive = activeFilterCount(draft)

  // Options of the open group, each with its live count. Big lists are ordered
  // by count (most jobs first); a selected option with zero matches stays
  // visible so it can always be unticked.
  const rows = useMemo(() => {
    if (!group) return []
    let base
    switch (group.id) {
      case 'workMode':
        base = WORK_MODE_OPTIONS
        break
      case 'category':
        base = DEPARTMENT_OPTIONS
        break
      case 'salary':
        base = SALARY_OPTIONS
        break
      case 'jobType':
      case 'location':
      case 'company':
        base = options[group.id]
        break
      case 'posted':
        base = POSTED_OPTIONS
        break
      case 'sort':
        return SORT_OPTIONS.map((o) => ({ ...o, count: null }))
      default:
        return []
    }
    const selected = new Set(draft[group.id] ?? [])
    const withCounts = base.map((o) => ({ ...o, count: o.id === 'any' ? null : facetCount(jobs, draft, group.id, o.id, query) }))
    const visible = withCounts.filter((o) => o.id === 'any' || o.count > 0 || selected.has(o.id))
    if (['category', 'jobType', 'location', 'company'].includes(group.id)) {
      visible.sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.label.localeCompare(b.label))
    }
    return visible
  }, [group, jobs, draft, query, options])

  const needle = optionSearch.trim().toLowerCase()
  const shownRows = group?.searchable && needle ? rows.filter((r) => r.label.toLowerCase().includes(needle)) : rows

  function pickGroup(id) {
    setActiveGroup(id)
    setOptionSearch('')
  }

  function apply() {
    navigation.navigate('JobList', { appliedFilters: draft, appliedQuery: query })
  }

  function clearAll() {
    setDraft(DEFAULT_FILTERS)
    setQuery('')
  }

  function renderOptions() {
    if (!group) return null
    if (group.kind === 'experience') {
      return <ExperiencePicker value={draft.experience} onChange={(n) => setDraft((f) => ({ ...f, experience: n }))} />
    }
    return (
      <View>
        {group.searchable ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.sm,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
              marginBottom: spacing.sm,
            }}
          >
            <Feather name="search" size={15} color={colors.inkTertiary} />
            <TextInput
              value={optionSearch}
              onChangeText={setOptionSearch}
              placeholder={`Search ${group.label.toLowerCase()}`}
              placeholderTextColor={colors.inkTertiary}
              accessibilityLabel={`Search ${group.label}`}
              style={{ flex: 1, minHeight: 42, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 14, padding: 0 }}
            />
          </View>
        ) : null}
        {shownRows.map((row) => {
          if (group.kind === 'single') {
            const selected = (group.id === 'sort' ? draft.sort : draft.posted) === row.id
            return (
              <OptionRow
                key={row.id}
                label={row.label}
                count={row.count}
                selected={selected}
                onPress={() => setDraft((f) => ({ ...f, [group.id]: row.id }))}
              />
            )
          }
          return (
            <OptionRow
              key={row.id}
              label={row.label}
              count={row.count}
              multi
              selected={draft[group.id].includes(row.id)}
              onPress={() => setDraft((f) => toggleFilterValue(f, group.id, row.id))}
            />
          )
        })}
        {shownRows.length === 0 ? (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, paddingVertical: spacing.md }}>
            {needle ? 'No matches.' : 'Nothing to filter by yet.'}
          </Text>
        ) : null}
      </View>
    )
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Job title, skill, company or location" autoFocus={!initialQuery && !initialFilters && !initialGroup} />
      </View>

      <View style={{ flex: 1, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
        <ScrollView style={{ width: RAIL_WIDTH, backgroundColor: colors.bgSecondary }} contentContainerStyle={{ paddingVertical: spacing.xs }}>
          {groups.map((g) => {
            const active = g.id === group?.id
            const count = groupSelectionCount(draft, g.id)
            return (
              <Pressable
                key={g.id}
                onPress={() => pickGroup(g.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: spacing.md,
                  backgroundColor: active ? colors.surface : 'transparent',
                  borderLeftWidth: 3,
                  borderLeftColor: active ? colors.navy : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4,
                }}
              >
                <Text
                  style={{ flex: 1, color: active ? colors.navy : colors.ink, fontFamily: active ? fontFamily.bold : fontFamily.medium, fontSize: 13 }}
                >
                  {g.label}
                </Text>
                {count > 0 ? (
                  <View
                    style={{
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      paddingHorizontal: 5,
                      backgroundColor: colors.navy,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 10.5 }}>{count}</Text>
                  </View>
                ) : null}
              </Pressable>
            )
          })}
        </ScrollView>

        <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
          {group ? (
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15, marginBottom: spacing.sm }}>{group.label}</Text>
          ) : null}
          {renderOptions()}
        </ScrollView>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.md,
          padding: spacing.lg,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Button title="Clear all" variant="secondary" onPress={clearAll} disabled={totalActive === 0 && !query && draft.sort === 'relevance'} style={{ flex: 1 }} />
        <Button
          title={resultCount === 0 ? 'No jobs found' : `Show ${resultCount} job${resultCount === 1 ? '' : 's'}`}
          onPress={apply}
          style={{ flex: 2 }}
        />
      </View>
    </SafeAreaView>
  )
}
