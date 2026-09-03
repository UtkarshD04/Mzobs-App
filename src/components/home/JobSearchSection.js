import { View, Text, ScrollView } from 'react-native'
import { useTheme } from '../../theme'
import SearchBar from '../ui/SearchBar'
import CategoryChip from './CategoryChip'
import WorkModeSegment from './WorkModeSegment'
import HeroPattern from './HeroPattern'
import { CATEGORY_BY_ID, QUICK_CHIP_IDS } from './categoryData'

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']

export default function JobSearchSection({ query, onChangeQuery, selectedCategory, onSelectCategory, workMode, onSelectWorkMode }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const quickChips = QUICK_CHIP_IDS.map((id) => CATEGORY_BY_ID[id]).filter(Boolean)

  return (
    <View
      style={{
        backgroundColor: colors.bgSecondary,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        overflow: 'hidden',
      }}
    >
      <HeroPattern />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 21, letterSpacing: -0.3 }}>
          Find your next opportunity
        </Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 3 }}>
          Search live openings from verified employers.
        </Text>

        <View style={{ marginTop: spacing.md }}>
          <SearchBar
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Job title, skill, company or location"
            style={{
              borderColor: colors.border,
              borderRadius: radius.lg,
              paddingVertical: 12,
              backgroundColor: colors.surface,
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
          style={{ flexGrow: 0 }}
        >
          {quickChips.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              active={selectedCategory === cat.id}
              onPress={() => onSelectCategory(cat.id)}
            />
          ))}
        </ScrollView>

        <WorkModeSegment options={WORK_MODES} value={workMode} onChange={onSelectWorkMode} />
      </View>
    </View>
  )
}
