import { View, Text, ScrollView, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import HeroPattern from './HeroPattern'
import PressableScale from '../ui/PressableScale'

// Mirrors the website's homepage hero (Website/Landing-Frontend's
// JobSearchHero.jsx) — same eyebrow/heading/subhead copy and "Popular:"
// quick-search links. The search field itself is a button, not a live text
// input: tapping it (or a Popular term) opens the dedicated Search &
// Filters page (Naukri/Indeed-style — a keyword field plus every filter
// group at once), rather than filtering this Home screen in place.
const POPULAR_SEARCHES = ['Software Developer', 'Sales Executive', 'HR Executive', 'Data Analyst', 'Fresher Jobs']

export default function JobSearchSection({ onOpenSearch }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()

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

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <Feather name="shield" size={11} color={colors.teal} />
          <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 11 }}>Verified opportunities. Real employers.</Text>
        </View>

        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18, letterSpacing: -0.2, lineHeight: 22 }} numberOfLines={2}>
          Find work that moves your{'\n'}career forward.
        </Text>
        <Text
          style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4 }}
          numberOfLines={1}
        >
          Reviewed listings from employers who are actually hiring.
        </Text>

        <PressableScale
          onPress={() => onOpenSearch('')}
          accessibilityRole="button"
          accessibilityLabel="Search jobs and open filters"
          scaleTo={0.985}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              minHeight: 48,
            },
            Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 8 },
              android: { elevation: isDark ? 0 : 1 },
            }),
          ]}
        >
          <Feather name="search" size={16} color={colors.inkTertiary} />
          <Text style={{ flex: 1, color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14 }}>
            Job title, skill, company or location
          </Text>
          <Feather name="sliders" size={15} color={colors.inkTertiary} />
        </PressableScale>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 6 }}>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>Popular:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {POPULAR_SEARCHES.map((term) => (
                <Pressable key={term} onPress={() => onOpenSearch(term)} hitSlop={6}>
                  <Text style={{ color: colors.teal, fontFamily: fontFamily.medium, fontSize: 11.5 }}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}
