import { useMemo } from 'react'
import { View, ScrollView } from 'react-native'
import { useTheme } from '../../theme'
import SectionHeader from './SectionHeader'
import CategoryTile from './CategoryTile'
import { CATEGORY_BY_ID, GRID_CATEGORY_IDS, jobMatchesCategory } from './categoryData'

const TILE_HEIGHT = 96

export default function CategorySection({ jobs, selectedCategory, onSelectCategory }) {
  const { spacing } = useTheme()

  const counts = useMemo(() => {
    const map = {}
    for (const id of GRID_CATEGORY_IDS) {
      if (id === 'all') continue
      map[id] = jobs.filter((job) => jobMatchesCategory(job, id)).length
    }
    return map
  }, [jobs])

  // "All jobs" always leads; everything else is ordered by real open-role
  // count (Array#sort is stable, so ties keep their original spec order) —
  // categories with live openings surface before empty ones instead of
  // competing for attention with a prominent "0 open" label.
  const orderedIds = useMemo(() => {
    const rest = GRID_CATEGORY_IDS.filter((id) => id !== 'all').slice()
    rest.sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    return ['all', ...rest]
  }, [counts])

  return (
    <View style={{ marginTop: spacing.lg }}>
      <SectionHeader title="Browse by category" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'column',
          flexWrap: 'wrap',
          height: TILE_HEIGHT * 2 + spacing.sm,
          paddingLeft: spacing.lg,
        }}
        style={{ flexGrow: 0 }}
      >
        {orderedIds.map((id) => {
          const cat = CATEGORY_BY_ID[id]
          return (
            <View key={id} style={{ height: TILE_HEIGHT, justifyContent: 'center' }}>
              <CategoryTile
                label={cat.label}
                icon={cat.icon}
                tone={cat.tone}
                count={id === 'all' ? null : counts[id]}
                active={selectedCategory === id}
                onPress={() => onSelectCategory(id)}
              />
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
