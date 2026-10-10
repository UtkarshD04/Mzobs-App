import { View, Text, ScrollView, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { CATEGORY_BY_ID, QUICK_CHIP_IDS } from './categoryData'
import { DEFAULT_FILTERS, SORT_OPTIONS, activeFilterChips, activeFilterCount, normalizeFilters, removeFilterValue } from '../../lib/jobFilters'

// Under the Latest-opportunities heading: department tabs (underlined), the
// removable applied-filter chips with "Clear all", and the sort control, as on
// the website's JobMarketplace. The full filter panel is JobFiltersSheet,
// opened from the Filters button in the section header or from Sort.
export default function JobFeedFilters({ filters, query, jobs, onChange, onClearQuery, onOpenFilters }) {
  const { colors, spacing, fontFamily } = useTheme()
  const f = normalizeFilters(filters)
  const count = activeFilterCount(f) + (query ? 1 : 0)
  const chips = activeFilterChips(f, jobs)
  const sortLabel = SORT_OPTIONS.find((o) => o.id === f.sort)?.label ?? 'Relevance'

  function toggleDepartment(id) {
    if (id === 'all') onChange({ ...f, category: [] })
    else onChange({ ...f, category: f.category.includes(id) ? f.category.filter((c) => c !== id) : [...f.category, id] })
  }

  return (
    <View>
      {/* Department tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {QUICK_CHIP_IDS.map((id) => {
          const active = id === 'all' ? f.category.length === 0 : f.category.includes(id)
          const label = id === 'all' ? 'All' : CATEGORY_BY_ID[id]?.label ?? id
          return (
            <Pressable
              key={id}
              onPress={() => toggleDepartment(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: active ? colors.navy : 'transparent', marginBottom: -1 }}
            >
              <Text style={{ color: active ? colors.navy : colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 14 }}>{label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Applied filters + sort */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }} numberOfLines={1}>
          {count > 0 ? `${count} filter${count === 1 ? '' : 's'} applied` : 'Showing all openings'}
        </Text>
        <Pressable onPress={onOpenFilters} accessibilityRole="button" accessibilityLabel={`Sort: ${sortLabel}`} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>Sort:</Text>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 13 }}>{sortLabel}</Text>
          <Feather name="chevron-down" size={14} color={colors.navy} />
        </Pressable>
      </View>

      {chips.length > 0 || query ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8, alignItems: 'center', paddingTop: 10 }}>
          {query ? (
            <Pressable onPress={onClearQuery} accessibilityRole="button" accessibilityLabel={`Remove search ${query}`} style={chipStyle(colors)}>
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>“{query}”</Text>
              <Feather name="x" size={12} color={colors.navy} />
            </Pressable>
          ) : null}
          {chips.map((chip) => (
            <Pressable key={chip.key} onPress={() => onChange(removeFilterValue(f, chip.group, chip.value))} accessibilityRole="button" accessibilityLabel={`Remove filter ${chip.label}`} style={chipStyle(colors)}>
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{chip.label}</Text>
              <Feather name="x" size={12} color={colors.navy} />
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              onChange({ ...DEFAULT_FILTERS })
              onClearQuery()
            }}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5, paddingHorizontal: 4 }}>Clear all</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  )
}

const chipStyle = (colors) => ({
  height: 28,
  paddingLeft: 10,
  paddingRight: 8,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: colors.navyTint,
})
