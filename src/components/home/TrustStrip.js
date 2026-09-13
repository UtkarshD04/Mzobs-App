import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Mirrors the website's TrustStrip.jsx — three real trust signals right
// under the hero (no invented ratings/headcounts): the same live-openings
// total the rest of Home already fetched, plus MZOBS's two standing
// operating claims (employer verification, human-reviewed applications).
function points(total) {
  return [
    {
      icon: 'shield',
      title: 'Verified employers',
      desc: 'Every company is reviewed before a role goes live.',
    },
    {
      icon: 'briefcase',
      title: total != null ? `${total.toLocaleString('en-IN')} live opening${total === 1 ? '' : 's'}` : 'Live openings, updated daily',
      desc: 'Fresh roles added as employers post new requirements.',
    },
    {
      icon: 'user-check',
      title: 'Real application support',
      desc: 'Applications are reviewed by our team, not filtered by a bot.',
    },
  ]
}

export default function TrustStrip({ total }) {
  const { colors, spacing, fontFamily } = useTheme()
  const items = points(total)

  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
      }}
    >
      {items.map(({ icon, title, desc }) => (
        <View key={title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.tealTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name={icon} size={15} color={colors.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13.5 }}>{title}</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 1 }}>{desc}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
