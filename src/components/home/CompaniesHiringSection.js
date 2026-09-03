import { View, Text, Pressable, Image, FlatList, Platform } from 'react-native'
import { useTheme } from '../../theme'
import Avatar from '../ui/Avatar'
import SectionHeader from './SectionHeader'
import { COMPANIES_HIRING_DATA } from './companiesHiringData'

function CompanyCard({ name, logo, industry, openRoles, onPress }) {
  const { colors, spacing, radius, fontFamily, isDark } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name} — ${openRoles} open roles`}
      style={[
        {
          width: 138,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          alignItems: 'flex-start',
          marginRight: spacing.sm,
        },
        Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 6 },
          android: { elevation: isDark ? 0 : 1 },
        }),
      ]}
    >
      {logo ? (
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: radius.sm,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
          }}
        >
          <Image source={logo} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        </View>
      ) : (
        <Avatar name={name} size={42} />
      )}

      <Text
        numberOfLines={2}
        style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5, marginTop: spacing.sm, minHeight: 32 }}
      >
        {name}
      </Text>
      <Text numberOfLines={1} style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 10.5, marginTop: 1 }}>
        {industry}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginTop: spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          alignSelf: 'stretch',
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 11 }}>
          {openRoles} open role{openRoles === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  )
}

export default function CompaniesHiringSection({ onSeeAll }) {
  const { spacing } = useTheme()

  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHeader
        title="Companies hiring now"
        statusLabel="Live"
        subtitle="Real, verified employers actively building their teams on Mzobs."
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        data={COMPANIES_HIRING_DATA}
        keyExtractor={(company) => company.name}
        renderItem={({ item: company }) => (
          <CompanyCard
            name={company.name}
            logo={company.logo}
            industry={company.industry}
            openRoles={company.openRoles}
            onPress={onSeeAll}
          />
        )}
      />
    </View>
  )
}
