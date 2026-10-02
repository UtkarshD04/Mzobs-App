import { ScrollView, Text, Pressable } from 'react-native'
import { useTheme } from '../../theme'
import { CATEGORY_BY_ID, QUICK_CHIP_IDS } from './categoryData'

// Mirrors the website's JobMarketplace department tabs (the pill row right
// under "Opportunities Worth Exploring": All / Technology / Sales / ... —
// active tab is solid ink, inactive is an outlined pill) — filters the
// same `selectedCategory` state CategoryGrid's tiles already drive, so
// picking a tab here and picking a tile further down the page stay in sync.
export default function DepartmentTabs({ selected, onSelect }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
      style={{ marginTop: spacing.sm }}
    >
      {QUICK_CHIP_IDS.map((id) => {
        const active = id === 'all' ? selected === 'all' : selected === id
        const label = id === 'all' ? 'All' : CATEGORY_BY_ID[id]?.label ?? id
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              height: 36,
              paddingHorizontal: 16,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.ink : colors.surface,
              borderWidth: active ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: active ? colors.surface : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
