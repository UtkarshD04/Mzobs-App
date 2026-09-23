import { View, Text, ScrollView, Pressable } from 'react-native'
import { useTheme } from '../../theme'

// Mirrors the website's QuickDiscoveryStrip.jsx — a row of small text
// shortcuts (not pills) sitting right under the hero search, each jumping
// straight to a pre-filtered jobs list via the same onOpenSearch the hero
// search bar and popular-searches row already use (see HomeScreen.openSearch).
const ITEMS = [
  { label: 'Remote jobs', location: 'Remote' },
  { label: 'Jobs for freshers', experience: 0 },
  { label: 'Bengaluru', location: 'Bengaluru' },
  { label: 'Delhi NCR', location: 'Delhi NCR' },
  { label: 'Mumbai', location: 'Mumbai' },
  { label: 'Hyderabad', location: 'Hyderabad' },
]

export default function QuickDiscoveryStrip({ onOpenSearch }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <View style={{ paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: 'center' }}>
        {ITEMS.map((item, i) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => onOpenSearch({ location: item.location ?? '', experience: item.experience ?? null })}
              accessibilityRole="button"
              hitSlop={6}
              style={{ height: 32, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
            >
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>{item.label}</Text>
            </Pressable>
            {i < ITEMS.length - 1 ? <Text style={{ color: colors.border, fontSize: 13 }}>·</Text> : null}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
