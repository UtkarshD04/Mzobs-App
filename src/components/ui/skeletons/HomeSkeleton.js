import { View, ScrollView, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../../theme'
import Card from '../Card'
import Skeleton from '../Skeleton'

// Mirrors Home's real layout (hero, quick strip, section header, card row) so
// content fades in where the placeholder already sat instead of jumping.
export default function HomeSkeleton() {
  const { colors, spacing } = useTheme()
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(340, width * 0.88)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['left', 'right']}>
      <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={{ backgroundColor: colors.surfaceSunken, paddingTop: 90, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg }}>
          <Skeleton width="65%" height={26} />
          <Skeleton width="45%" height={14} style={{ marginTop: 10 }} />
          <Skeleton height={48} radius={14} style={{ marginTop: spacing.lg, backgroundColor: colors.surface }} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={78} height={34} radius={17} />
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Skeleton width={160} height={18} />
          <Skeleton width={110} height={12} style={{ marginTop: 8 }} />
        </View>

        <View style={{ flexDirection: 'row', paddingLeft: spacing.lg, marginTop: spacing.md }}>
          {[0, 1].map((i) => (
            <Card key={i} style={{ width: cardWidth, height: 200, marginRight: spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Skeleton width={48} height={48} radius={14} />
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
      </ScrollView>
    </SafeAreaView>
  )
}
