import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function ApplicationsSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width={170} height={20} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />

      {[0, 1, 2].map((i) => (
        <Card key={i} style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="55%" height={15} />
            <Skeleton width={70} height={20} radius={8} />
          </View>
          <Skeleton width={100} height={11} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.md }}>
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} width={70} height={20} radius={8} />
            ))}
          </View>
        </Card>
      ))}
    </ScreenContainer>
  )
}
