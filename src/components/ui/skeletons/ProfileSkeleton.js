import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function ProfileSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Skeleton width={56} height={56} radius={28} />
        <View style={{ flex: 1 }}>
          <Skeleton width={110} height={20} />
          <Skeleton width={160} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={{ marginBottom: spacing.md }}>
            <Skeleton width={90} height={11} />
            <Skeleton height={40} radius={12} style={{ marginTop: 6 }} />
          </View>
        ))}
        <Skeleton height={46} radius={12} />
      </Card>
    </ScreenContainer>
  )
}
