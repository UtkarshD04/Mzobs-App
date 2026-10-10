import { Text, ScrollView, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Quick-search chips under the search bar: white outlined pills with a
// chevron, each jumping straight to a pre-filtered jobs list via the same
// onOpenSearch the search bar uses (see HomeScreen.openSearch).
const ITEMS = [
  { label: 'Remote jobs', location: 'Remote' },
  { label: 'Fresher', experience: 0 },
  { label: 'Bengaluru', location: 'Bengaluru' },
  { label: 'Delhi NCR', location: 'Delhi NCR' },
  { label: 'Mumbai', location: 'Mumbai' },
  { label: 'Hyderabad', location: 'Hyderabad' },
]

export default function QuickDiscoveryStrip({ onOpenSearch }) {
  const { colors, fontFamily } = useTheme()

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
      {ITEMS.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => onOpenSearch({ location: item.location ?? '', experience: item.experience ?? null })}
          accessibilityRole="button"
          style={{
            height: 38,
            paddingHorizontal: 14,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 14 }}>{item.label}</Text>
          <Feather name="chevron-right" size={14} color={colors.inkSecondary} />
        </Pressable>
      ))}
    </ScrollView>
  )
}
