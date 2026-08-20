import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function DashboardSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width={160} height={22} />
      <Skeleton width={220} height={13} style={{ marginTop: 8 }} />

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        <Skeleton height={44} radius={12} style={{ flex: 1 }} />
        <Skeleton height={44} radius={12} style={{ flex: 1 }} />
      </View>

      {[0, 1, 2].map((i) => (
        <Card key={i} style={{ marginTop: i === 0 ? spacing.lg : spacing.md }}>
          <Skeleton width={110} height={11} />
          <Skeleton width={70} height={26} style={{ marginTop: spacing.sm }} />
          <Skeleton height={6} radius={4} style={{ marginTop: spacing.sm }} />
        </Card>
      ))}

      <Skeleton width={120} height={15} style={{ marginTop: spacing.xl, marginBottom: spacing.sm }} />
      <Card style={{ padding: 0 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'transparent' }}>
            <Skeleton width="70%" height={13} />
            <Skeleton width={90} height={11} style={{ marginTop: 6 }} />
          </View>
        ))}
      </Card>
    </ScreenContainer>
  )
}
