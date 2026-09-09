import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

function Row() {
  const { spacing } = useTheme()
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Skeleton width={48} height={48} radius={14} />
        <View style={{ flex: 1 }}>
          <Skeleton width="70%" height={15} />
          <Skeleton width="45%" height={12} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm }}>
            <Skeleton width={60} height={20} radius={8} />
            <Skeleton width={60} height={20} radius={8} />
          </View>
        </View>
      </View>
    </Card>
  )
}

export default function JobRowSkeleton() {
  return (
    <ScreenContainer scroll={false}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Row key={i} />
      ))}
    </ScreenContainer>
  )
}
