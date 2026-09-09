import { View, Text, Image, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Avatar from '../ui/Avatar'
import PressableScale from '../ui/PressableScale'
import SectionHeader from './SectionHeader'
import { COMPANIES_HIRING_DATA } from './companiesHiringData'

const CARD_WIDTH = 208

// Compact horizontal company row — a small logo/initial mark, name,
// industry and a real opening count, sized to its content instead of a
// tall square tile with a lot of empty space underneath.
function CompanyCard({ name, logo, industry, openRoles, onPress }) {
  const { colors, spacing, radius, fontFamily } = useTheme()

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name} — ${openRoles} open roles`}
      scaleTo={0.97}
      style={{
        width: CARD_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
      }}
    >
      {logo ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.sm,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
          }}
        >
          <Image source={logo} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        </View>
      ) : (
        <Avatar name={name} size={44} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }} numberOfLines={1}>
          {name}
        </Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11, marginTop: 1 }} numberOfLines={1}>
          {industry}
        </Text>
        <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
          {openRoles} open role{openRoles === 1 ? '' : 's'}
        </Text>
      </View>

      <Feather name="chevron-right" size={14} color={colors.inkTertiary} />
    </PressableScale>
  )
}

export default function CompaniesHiringSection({ onSeeAll }) {
  const { spacing } = useTheme()

  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHeader
        title="Companies hiring through Mzobs"
        subtitle={`${COMPANIES_HIRING_DATA.length} verified partners actively building their teams.`}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        {COMPANIES_HIRING_DATA.map((company) => (
          <View key={company.name} style={{ marginRight: spacing.sm }}>
            <CompanyCard name={company.name} logo={company.logo} industry={company.industry} openRoles={company.openRoles} onPress={onSeeAll} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
