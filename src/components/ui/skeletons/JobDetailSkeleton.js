import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function JobDetailSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width="75%" height={22} />
      <Skeleton width="55%" height={13} style={{ marginTop: 8 }} />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <Skeleton width={90} height={22} radius={8} />
        <Skeleton width={70} height={22} radius={8} />
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <Skeleton width={120} height={14} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
      </Card>

      <Skeleton height={46} radius={12} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  )
}
