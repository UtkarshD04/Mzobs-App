import { useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import PressableScale from '../ui/PressableScale'
import SectionHeader from './SectionHeader'
import { CATEGORY_BY_ID, GRID_CATEGORY_IDS, jobMatchesCategory } from './categoryData'

// Mirrors the website's CategorySection.jsx: a two-column grid of white,
// rounded cards, each with a solid tone-coloured icon square, the category
// name and its live opening count. Tone colours are that file's CATEGORIES
// tones (re-keyed from its track names to this app's category ids).
const TILE_TONES = {
  technology: '#0b7a6d',
  sales: '#0891b2',
  marketing: '#ea580c',
  design: '#e11d74',
  finance: '#15803d',
  hr: '#7c3aed',
  operations: '#b45309',
  support: '#0D9488',
  freshers: '#4d7c0f',
  remote: '#102a43',
}

function CategoryTile({ label, icon, tone, count, onPress }) {
  const { colors, fontFamily } = useTheme()
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      scaleTo={0.97}
      style={{
        width: 148,
        alignItems: 'center',
        gap: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: 10,
        paddingVertical: 18,
      }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: tone }}>
        <Feather name={icon} size={20} color="#fff" />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }} numberOfLines={1}>
          {label}
        </Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {count === 0 ? 'No openings yet' : `${count.toLocaleString('en-IN')} ${count === 1 ? 'opening' : 'openings'}`}
        </Text>
      </View>
    </PressableScale>
  )
}

export default function CategoryGrid({ jobs, onSelectCategory }) {
  const { colors, spacing } = useTheme()

  const counts = useMemo(() => {
    const map = {}
    for (const id of GRID_CATEGORY_IDS) {
      if (id === 'all') continue
      map[id] = jobs.filter((job) => jobMatchesCategory(job, id)).length
    }
    return map
  }, [jobs])

  const tileIds = GRID_CATEGORY_IDS.filter((id) => id !== 'all')

  return (
    <View style={{ marginTop: 28, paddingVertical: 24, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
      <SectionHeader title="Browse by category" subtitle="Live opening counts. Pick one to filter the job feed." />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={148 + 10}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: 10 }}
      >
        {tileIds.map((id) => {
          const cat = CATEGORY_BY_ID[id]
          return (
            <CategoryTile
              key={id}
              label={cat.label}
              icon={cat.icon}
              tone={TILE_TONES[id] ?? '#0b7a6d'}
              count={counts[id] ?? 0}
              onPress={() => onSelectCategory(id)}
            />
          )
        })}
      </ScrollView>
    </View>
  )
}
