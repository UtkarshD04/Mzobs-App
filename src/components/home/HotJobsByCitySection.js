import { useMemo, useState } from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useHotCitiesQuery } from '../../hooks/useHotCities'
import { fmtSalaryRange } from '../../lib/format'
import PressableScale from '../ui/PressableScale'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'
import SectionHeader from './SectionHeader'
import { HOT_CITIES_META } from './hotCitiesData'

const CARD_WIDTH = 224
const IMAGE_HEIGHT = 104

function FilterPill({ label, active, onPress }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      scaleTo={0.95}
      style={{
        height: 30,
        paddingHorizontal: spacing.md,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.navy : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.navy : colors.border,
      }}
    >
      <Text style={{ color: active ? '#ffffff' : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </PressableScale>
  )
}

function CityImage({ city, imageUrl }) {
  const { colors } = useTheme()
  const [failed, setFailed] = useState(false)

  if (!imageUrl || failed) {
    return (
      <View style={{ ...StyleSheetAbsoluteFill, backgroundColor: colors.navy, alignItems: 'flex-end', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <Text style={{ color: 'rgba(255,255,255,0.16)', fontFamily: 'Inter_700Bold', fontSize: 72, lineHeight: 76, marginRight: -6, marginBottom: -14 }}>
          {city[0]}
        </Text>
      </View>
    )
  }

  return <Image source={{ uri: imageUrl }} onError={() => setFailed(true)} resizeMode="cover" style={StyleSheetAbsoluteFill} />
}

const StyleSheetAbsoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }

function CityCard({ meta, stats, isTopCity, onPress }) {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const categories = stats.topCategories ?? []
  const salary = fmtSalaryRange({ salaryMin: stats.salaryMin, salaryMax: stats.salaryMax })
  const showBadge = isTopCity || stats.newThisWeek > 0

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Explore jobs in ${meta.city}`}
      scaleTo={0.97}
      style={{
        width: CARD_WIDTH,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: IMAGE_HEIGHT }}>
        <CityImage city={meta.city} imageUrl={meta.imageUrl} />
        <View style={{ ...StyleSheetAbsoluteFill, backgroundColor: 'rgba(10,20,32,0.28)' }} />

        {showBadge ? (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              paddingHorizontal: 7,
              paddingVertical: 3,
            }}
          >
            <Feather name={isTopCity ? 'trending-up' : 'zap'} size={10} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 9.5 }}>{isTopCity ? 'Trending' : 'Hiring fast'}</Text>
          </View>
        ) : null}

        <View style={{ position: 'absolute', bottom: 8, left: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="map-pin" size={12} color="#ffffff" style={{ opacity: 0.9 }} />
          <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 16 }} numberOfLines={1}>
            {meta.city}
          </Text>
        </View>
      </View>

      <View style={{ padding: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>{stats.openings}+</Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>openings</Text>
        </View>

        {categories.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {categories.slice(0, 2).map((c) => (
              <View key={c} style={{ backgroundColor: colors.surfaceSunken, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 10.5 }} numberOfLines={1}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 11.5, marginTop: 6 }} numberOfLines={1}>
          {salary || 'Varies by role'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 }}>
            <Feather name="shield" size={10.5} color={colors.teal} />
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 10.5 }} numberOfLines={1}>
              {stats.verifiedEmployers > 0 ? `${stats.verifiedEmployers} verified` : 'Verified'}
            </Text>
          </View>
          <Feather name="arrow-right" size={13} color={colors.teal} />
        </View>
      </View>
    </PressableScale>
  )
}

function CityCardSkeleton() {
  const { colors, radius, spacing } = useTheme()
  return (
    <View style={{ width: CARD_WIDTH, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' }}>
      <Skeleton width={CARD_WIDTH} height={IMAGE_HEIGHT} radius={0} />
      <View style={{ padding: spacing.sm }}>
        <Skeleton width={70} height={18} />
        <Skeleton width={110} height={12} style={{ marginTop: 8 }} />
        <Skeleton width={90} height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  )
}

// Mirrors the website's "Hot Jobs by City" section — real per-city ×
// category stats from GET /api/jobs/hot-cities (see hooks/useHotCities.js),
// joined onto the curated city/photo metadata in hotCitiesData.js by slug.
// Tapping a city opens the Jobs tab's Search & Filters page with the city
// name as the keyword, the same "search, don't locally filter" pattern the
// hero and popular-search links already use.
export default function HotJobsByCitySection({ onOpenSearch }) {
  const { spacing } = useTheme()
  const [activeFilter, setActiveFilter] = useState('all')
  const { data, isLoading, isError, refetch } = useHotCitiesQuery()

  const cities = useMemo(() => {
    if (!data?.cities) return []
    const bySlug = new Map(data.cities.map((c) => [c.slug, c]))
    return HOT_CITIES_META.cities
      .map((meta) => {
        const stats = bySlug.get(meta.slug)?.byFilter?.[activeFilter]
        return stats ? { meta, stats } : null
      })
      .filter((c) => c && c.stats.openings > 0)
      .sort((a, b) => b.stats.openings - a.stats.openings)
  }, [data, activeFilter])

  const topCityName = cities[0]?.meta.city

  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHeader statusLabel={HOT_CITIES_META.eyebrow} title={HOT_CITIES_META.title} subtitle={HOT_CITIES_META.subtitle} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        style={{ marginBottom: spacing.sm }}
      >
        {HOT_CITIES_META.filters.map((f) => (
          <FilterPill key={f.key} label={f.label} active={activeFilter === f.key} onPress={() => setActiveFilter(f.key)} />
        ))}
      </ScrollView>

      {isError ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <EmptyState icon="cloud-off" title="Couldn't load city hiring data" message="Check your connection and try again." />
          <Button title="Retry" variant="secondary" onPress={() => refetch()} style={{ alignSelf: 'center', width: 140, marginTop: -spacing.md }} />
        </View>
      ) : isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <CityCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : cities.length === 0 ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <EmptyState icon="map-pin" title="No live openings in this category yet" message="Try a different category, or check back soon." />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + spacing.sm}
          snapToAlignment="start"
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        >
          {cities.map(({ meta, stats }) => (
            <CityCard
              key={meta.slug}
              meta={meta}
              stats={stats}
              isTopCity={meta.city === topCityName}
              onPress={() => onOpenSearch(meta.city)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
