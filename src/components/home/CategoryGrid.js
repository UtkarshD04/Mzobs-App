import { useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import PressableScale from '../ui/PressableScale'
import SectionHeader from './SectionHeader'
import { CATEGORY_BY_ID, GRID_CATEGORY_IDS, jobMatchesCategory } from './categoryData'

const TILE_WIDTH = 144
const TILE_HEIGHT = 116

// Mirrors the website's CategoryGrid: every tile uses one monochrome teal
// icon treatment (not a colour per category) and a real live-openings count,
// with a single "Most in-demand" tag on whichever category has the most.
// Fixed width/height + a horizontal snap-scroll (matching the job-card
// carousels elsewhere on Home) instead of a wrapping grid, so every tile is
// exactly the same size regardless of label length.
function CategoryTile({ label, icon, count, mostInDemand, onPress }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const hasNoOpenings = count === 0

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      scaleTo={0.96}
      style={{
        width: TILE_WIDTH,
        height: TILE_HEIGHT,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        opacity: hasNoOpenings ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.tealTint, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={15} color={colors.teal} />
        </View>
        <Feather name="chevron-right" size={14} color={colors.inkTertiary} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13, marginTop: spacing.sm }} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5 }} numberOfLines={1}>
          {count} opening{count === 1 ? '' : 's'}
        </Text>
      </View>
      {mostInDemand ? (
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.tealTint, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginTop: 4 }}>
          <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 9 }}>MOST IN-DEMAND</Text>
        </View>
      ) : null}
    </PressableScale>
  )
}

export default function CategoryGrid({ jobs, onSelectCategory }) {
  const { spacing } = useTheme()

  const counts = useMemo(() => {
    const map = {}
    for (const id of GRID_CATEGORY_IDS) {
      if (id === 'all') continue
      map[id] = jobs.filter((job) => jobMatchesCategory(job, id)).length
    }
    return map
  }, [jobs])

  const topId = useMemo(() => {
    let best = null
    for (const id of GRID_CATEGORY_IDS) {
      if (id === 'all') continue
      if ((counts[id] ?? 0) > 0 && (!best || counts[id] > counts[best])) best = id
    }
    return best
  }, [counts])

  const tileIds = GRID_CATEGORY_IDS.filter((id) => id !== 'all')
  const totalOpenings = jobs.length

  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHeader title="Explore jobs by category" subtitle={`${totalOpenings} live opening${totalOpenings === 1 ? '' : 's'} across all categories.`} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={TILE_WIDTH + spacing.sm}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        {tileIds.map((id) => {
          const cat = CATEGORY_BY_ID[id]
          return (
            <View key={id} style={{ marginRight: spacing.sm }}>
              <CategoryTile
                label={cat.label}
                icon={cat.icon}
                count={counts[id] ?? 0}
                mostInDemand={id === topId}
                onPress={() => onSelectCategory(id)}
              />
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
