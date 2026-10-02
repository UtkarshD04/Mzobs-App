import { View, ScrollView, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../theme'
import Card from '../Card'
import Skeleton from '../Skeleton'

// Mirrors Home's current restructured layout section-for-section (hero ->
// quick strip -> job carousel -> category tile row -> city card row) so
// content fades in roughly where the placeholder already sat instead of
// jumping. Not a pixel-exact clone of every one of Home's sections (the
// match panel, campus block etc. are plain text-only sections with no card
// shape worth faking) — just enough of the repeating card-row shapes up
// top, where a mismatch is most visible, to avoid a jarring layout shift
// on load.
export default function HomeSkeleton() {
  const { colors, radius, spacing } = useTheme()
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(340, width * 0.88)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['left', 'right']}>
      <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Hero */}
        <View style={{ backgroundColor: colors.surfaceSunken, paddingTop: 90, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg }}>
          <Skeleton width="65%" height={26} />
          <Skeleton width="45%" height={14} style={{ marginTop: 10 }} />
          <Skeleton height={48} radius={radius.md} style={{ marginTop: spacing.lg, backgroundColor: colors.surface }} />
        </View>

        {/* Quick discovery strip */}
        <View style={{ flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={70} height={16} />
          ))}
        </View>

        {/* Opportunities Worth Exploring — job card carousel */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={110} height={12} style={{ marginTop: 8 }} />
        </View>

        <View style={{ flexDirection: 'row', paddingLeft: spacing.lg, marginTop: spacing.md }}>
          {[0, 1].map((i) => (
            <Card key={i} style={{ width: cardWidth, height: 200, marginRight: spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Skeleton width={48} height={48} radius={radius.md} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="75%" height={15} />
                  <Skeleton width="50%" height={12} style={{ marginTop: 8 }} />
                </View>
              </View>
              <Skeleton width="90%" height={12} style={{ marginTop: spacing.lg }} />
              <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
            </Card>
          ))}
        </View>

        {/* CategoryGrid tile row */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Skeleton width={130} height={16} />
        </View>
        <View style={{ flexDirection: 'row', paddingLeft: spacing.lg, marginTop: spacing.md }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={144} height={116} radius={radius.md} style={{ marginRight: spacing.sm }} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
