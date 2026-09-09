import { useMemo, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTheme } from '../../theme'
import { CATEGORIES } from '../../components/home/categoryData'
import ScreenContainer from '../../components/ui/ScreenContainer'
import SearchBar from '../../components/ui/SearchBar'
import FilterChip from '../../components/ui/FilterChip'
import Button from '../../components/ui/Button'
import {
  WORK_MODES,
  EXPERIENCE_BUCKETS,
  SALARY_BUCKETS,
  POSTED_BUCKETS,
  DEFAULT_FILTERS,
  matchesFilters,
  matchesQuery,
} from '../../lib/jobFilters'

function FilterGroup({ title, options, value, onChange }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.sm }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((opt) => (
          <FilterChip key={opt.id ?? opt} label={opt.label ?? opt} active={value === (opt.id ?? opt)} onPress={() => onChange(opt.id ?? opt)} />
        ))}
      </View>
    </View>
  )
}

// A dedicated full-screen search + filter page (Naukri/Indeed-style) — the
// single entry point for both the Home hero search box and the Jobs tab's
// "Filters" button. There's room for a keyword field plus every filter
// group at once, a live "Show N results" count, and a proper
// back-navigation flow: applying here passes query + filters back to
// JobList via route params.
export default function JobFiltersScreen({ navigation, route }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { filters: initialFilters, query: initialQuery = '', jobs = [] } = route.params ?? {}
  const [draft, setDraft] = useState(initialFilters ?? DEFAULT_FILTERS)
  const [query, setQuery] = useState(initialQuery)

  const locations = useMemo(() => Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))).sort(), [jobs])
  const jobTypes = useMemo(() => Array.from(new Set(jobs.map((j) => j.employmentType).filter(Boolean))).sort(), [jobs])

  const resultCount = useMemo(
    () => jobs.filter((job) => matchesFilters(job, draft) && matchesQuery(job, query)).length,
    [jobs, draft, query]
  )
  const activeFilterCount = Object.keys(DEFAULT_FILTERS).filter((k) => draft[k] !== DEFAULT_FILTERS[k]).length

  function apply() {
    navigation.navigate('JobList', { appliedFilters: draft, appliedQuery: query })
  }

  function clearAll() {
    setDraft(DEFAULT_FILTERS)
    setQuery('')
  }

  return (
    <ScreenContainer
      header={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
          }}
        >
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>Search & Filters</Text>
          {activeFilterCount > 0 || query ? (
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>Clear all</Text>
            </Pressable>
          ) : null}
        </View>
      }
      footer={
        <View style={{ padding: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button title={`Show ${resultCount} result${resultCount === 1 ? '' : 's'}`} onPress={apply} />
        </View>
      }
    >
      <View style={{ marginBottom: spacing.xl }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Job title, skill, company or location" autoFocus={!initialQuery} />
      </View>

      <FilterGroup
        title="Category"
        options={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        value={draft.category}
        onChange={(v) => setDraft((f) => ({ ...f, category: v }))}
      />
      <FilterGroup title="Work mode" options={WORK_MODES} value={draft.workMode} onChange={(v) => setDraft((f) => ({ ...f, workMode: v }))} />
      <FilterGroup
        title="Experience"
        options={EXPERIENCE_BUCKETS}
        value={draft.experience}
        onChange={(v) => setDraft((f) => ({ ...f, experience: v }))}
      />
      <FilterGroup title="Salary" options={SALARY_BUCKETS} value={draft.salary} onChange={(v) => setDraft((f) => ({ ...f, salary: v }))} />
      {jobTypes.length > 0 ? (
        <FilterGroup
          title="Job type"
          options={[{ id: 'any', label: 'Any type' }, ...jobTypes.map((t) => ({ id: t, label: t }))]}
          value={draft.jobType}
          onChange={(v) => setDraft((f) => ({ ...f, jobType: v }))}
        />
      ) : null}
      {locations.length > 0 ? (
        <FilterGroup
          title="Location"
          options={[{ id: 'any', label: 'Any location' }, ...locations.map((l) => ({ id: l, label: l }))]}
          value={draft.location}
          onChange={(v) => setDraft((f) => ({ ...f, location: v }))}
        />
      ) : null}
      <FilterGroup title="Posted" options={POSTED_BUCKETS} value={draft.posted} onChange={(v) => setDraft((f) => ({ ...f, posted: v }))} />
    </ScreenContainer>
  )
}
